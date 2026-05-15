package com.travelluhh.service;

import com.travelluhh.dto.trip.SettlementResponse;
import com.travelluhh.entity.Expense;
import com.travelluhh.entity.TripMember;
import com.travelluhh.entity.User;
import com.travelluhh.repository.ExpenseRepository;
import com.travelluhh.repository.TripMemberRepository;
import com.travelluhh.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SettlementService {

    private final ExpenseRepository expenseRepository;
    private final TripMemberRepository tripMemberRepository;
    private final UserRepository userRepository;

    public SettlementResponse calculate(Long tripId) {
        List<TripMember> members = tripMemberRepository.findByTripId(tripId);
        List<Expense> expenses = expenseRepository.findByTripIdOrderByExpenseDateDesc(tripId);

        if (members.isEmpty() || expenses.isEmpty()) {
            return SettlementResponse.builder()
                    .balances(Collections.emptyList())
                    .transactions(Collections.emptyList())
                    .totalSpent(BigDecimal.ZERO)
                    .build();
        }

        int memberCount = members.size();
        BigDecimal totalSpent = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal equalShare = totalSpent.divide(BigDecimal.valueOf(memberCount), 2, RoundingMode.HALF_UP);

        Map<Long, BigDecimal> paid = new HashMap<>();
        for (TripMember m : members) paid.put(m.getUserId(), BigDecimal.ZERO);
        for (Expense e : expenses) {
            if (e.getAddedBy() != null) {
                paid.merge(e.getAddedBy(), e.getAmount(), BigDecimal::add);
            }
        }

        Map<Long, User> userMap = new HashMap<>();
        for (TripMember m : members) {
            userRepository.findById(m.getUserId()).ifPresent(u -> userMap.put(u.getId(), u));
        }

        List<SettlementResponse.Balance> balances = members.stream().map(m -> {
            BigDecimal paidAmt = paid.getOrDefault(m.getUserId(), BigDecimal.ZERO);
            BigDecimal net = paidAmt.subtract(equalShare);
            User u = userMap.get(m.getUserId());
            return SettlementResponse.Balance.builder()
                    .userId(m.getUserId())
                    .name(u != null ? u.getName() : "Unknown")
                    .avatar(u != null ? u.getAvatar() : null)
                    .paid(paidAmt)
                    .share(equalShare)
                    .net(net)
                    .build();
        }).collect(Collectors.toList());

        List<SettlementResponse.Transaction> transactions = simplifyDebts(balances);

        return SettlementResponse.builder()
                .balances(balances)
                .transactions(transactions)
                .totalSpent(totalSpent)
                .build();
    }

    private List<SettlementResponse.Transaction> simplifyDebts(List<SettlementResponse.Balance> balances) {
        List<SettlementResponse.Transaction> result = new ArrayList<>();

        List<SettlementResponse.Balance> debtors = balances.stream()
                .filter(b -> b.getNet().compareTo(BigDecimal.ZERO) < 0)
                .sorted(Comparator.comparing(SettlementResponse.Balance::getNet))
                .collect(Collectors.toList());

        List<SettlementResponse.Balance> creditors = balances.stream()
                .filter(b -> b.getNet().compareTo(BigDecimal.ZERO) > 0)
                .sorted((a, b) -> b.getNet().compareTo(a.getNet()))
                .collect(Collectors.toList());

        Map<Long, BigDecimal> debtMap = new LinkedHashMap<>();
        for (var d : debtors) debtMap.put(d.getUserId(), d.getNet().abs());
        Map<Long, BigDecimal> creditMap = new LinkedHashMap<>();
        for (var c : creditors) creditMap.put(c.getUserId(), c.getNet());

        Map<Long, String> nameMap = new HashMap<>();
        for (var b : balances) nameMap.put(b.getUserId(), b.getName());

        for (var debtor : new ArrayList<>(debtMap.entrySet())) {
            BigDecimal owes = debtor.getValue();
            for (var creditor : new ArrayList<>(creditMap.entrySet())) {
                if (owes.compareTo(BigDecimal.ZERO) <= 0) break;
                BigDecimal owed = creditor.getValue();
                if (owed.compareTo(BigDecimal.ZERO) <= 0) continue;

                BigDecimal settle = owes.min(owed);
                result.add(SettlementResponse.Transaction.builder()
                        .fromUserId(debtor.getKey())
                        .fromName(nameMap.get(debtor.getKey()))
                        .toUserId(creditor.getKey())
                        .toName(nameMap.get(creditor.getKey()))
                        .amount(settle.setScale(2, RoundingMode.HALF_UP))
                        .build());

                owes = owes.subtract(settle);
                creditMap.put(creditor.getKey(), owed.subtract(settle));
            }
            debtMap.put(debtor.getKey(), owes);
        }

        return result;
    }
}

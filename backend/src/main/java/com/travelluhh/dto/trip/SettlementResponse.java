package com.travelluhh.dto.trip;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SettlementResponse {
    private List<Balance> balances;
    private List<Transaction> transactions;
    private BigDecimal totalSpent;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Balance {
        private Long userId;
        private String name;
        private String avatar;
        private BigDecimal paid;
        private BigDecimal share;
        private BigDecimal net;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Transaction {
        private Long fromUserId;
        private String fromName;
        private Long toUserId;
        private String toName;
        private BigDecimal amount;
    }
}

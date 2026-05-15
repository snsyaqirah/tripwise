package com.travelluhh.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "trip_activities")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "activity_id")
    private Long id;

    @Column(name = "trip_id", nullable = false)
    private Long tripId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "actor_name")
    private String actorName;

    @Column(name = "action_type", nullable = false, length = 50)
    private String actionType;

    @Column(nullable = false)
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

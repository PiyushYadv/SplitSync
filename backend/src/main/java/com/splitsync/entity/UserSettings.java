package com.splitsync.entity;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_settings")
@Getter
@Setter
@NoArgsConstructor
public class UserSettings {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "notification_preferences", nullable = false, columnDefinition = "jsonb")
    private Map<String, Boolean> notificationPreferences = defaultNotificationPreferences();

    @Column(nullable = false, length = 10)
    private String currency = "USD";

    @Column(nullable = false, length = 20)
    private String theme = "system";

    @Column(nullable = false, length = 50)
    private String language = "English";

    @Column(name = "date_format", nullable = false, length = 20)
    private String dateFormat = "MM/DD/YYYY";

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public UserSettings(User user) {
        this.user = user;
        this.currency = user.getDefaultCurrency();
    }

    private static Map<String, Boolean> defaultNotificationPreferences() {
        Map<String, Boolean> prefs = new LinkedHashMap<>();
        prefs.put("expense", true);
        prefs.put("settlement", true);
        prefs.put("reminder", false);
        prefs.put("digest", true);
        return prefs;
    }
}

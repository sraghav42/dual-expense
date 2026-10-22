package com.dualexpense.config;

import java.time.Clock;
import java.time.ZoneId;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TimeConfig {
    /**
     * The canonical household time zone. All "current date/month" logic in the
     * application is pinned to US Eastern time, regardless of the host or
     * container the JVM runs on.
     */
    public static final ZoneId HOUSEHOLD_ZONE = ZoneId.of("America/New_York");

    @Bean
    public Clock householdClock() {
        return Clock.system(HOUSEHOLD_ZONE);
    }
}

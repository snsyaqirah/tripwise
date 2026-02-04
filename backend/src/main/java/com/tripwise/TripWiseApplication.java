package com.tripwise;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for TripWise application
 * 
 * @SpringBootApplication is a convenience annotation that includes:
 * - @Configuration: Tags the class as a source of bean definitions
 * - @EnableAutoConfiguration: Enables Spring Boot's auto-configuration
 * - @ComponentScan: Enables component scanning in this package and sub-packages
 */
@SpringBootApplication
public class TripWiseApplication {

    public static void main(String[] args) {
        SpringApplication.run(TripWiseApplication.class, args);
    }
}

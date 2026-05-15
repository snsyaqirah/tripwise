package com.travelluhh;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class TravelLuhhApplication {

    public static void main(String[] args) {
        SpringApplication.run(TravelLuhhApplication.class, args);
    }
}

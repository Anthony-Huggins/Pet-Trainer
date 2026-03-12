package com.pawforward.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class PawForwardApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(PawForwardApiApplication.class, args);
    }
}

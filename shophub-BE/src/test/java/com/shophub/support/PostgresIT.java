package com.shophub.support;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(properties = {
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration,org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration,org.springframework.boot.autoconfigure.mail.MailSenderAutoConfiguration",
        "shophub.demo.enabled=true"
})
@AutoConfigureMockMvc
@Testcontainers
public abstract class PostgresIT {

    @ServiceConnection
    static final PostgreSQLContainer<?> postgres;

    static {
        System.setProperty("api.version", "1.44");
        postgres = new PostgreSQLContainer<>("postgres:16-alpine");
        postgres.start();
    }
}

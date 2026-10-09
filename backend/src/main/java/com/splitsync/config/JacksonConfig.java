package com.splitsync.config;

import java.io.IOException;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;

@Configuration
public class JacksonConfig {

    /** API-wide timestamp format: yyyy-MM-dd'T'HH:mm:ss.SSSXXX, always in UTC. */
    public static final DateTimeFormatter API_DATE_TIME_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").withZone(ZoneOffset.UTC);

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer instantFormatCustomizer() {
        return builder -> builder.serializerByType(Instant.class, new StdSerializer<>(Instant.class) {
            @Override
            public void serialize(Instant value, JsonGenerator gen, SerializerProvider provider) throws IOException {
                gen.writeString(API_DATE_TIME_FORMAT.format(value));
            }
        });
    }
}

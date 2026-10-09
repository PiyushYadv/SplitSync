package com.splitsync.config;

import java.util.Arrays;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.ConverterFactory;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.splitsync.entity.enums.DbEnum;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    /** Lets query params like {@code ?status=pending} bind to enums by their lowercase API value. */
    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverterFactory(new DbEnumConverterFactory());
    }

    @SuppressWarnings({ "rawtypes", "unchecked" })
    private static final class DbEnumConverterFactory implements ConverterFactory<String, Enum> {
        @Override
        public <T extends Enum> org.springframework.core.convert.converter.Converter<String, T> getConverter(
                Class<T> targetType) {
            if (!DbEnum.class.isAssignableFrom(targetType)) {
                return source -> (T) Enum.valueOf(targetType, source.trim());
            }
            return source -> Arrays.stream(targetType.getEnumConstants())
                    .filter(e -> ((DbEnum) e).dbValue().equalsIgnoreCase(source.trim()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Unknown value " + source));
        }
    }
}

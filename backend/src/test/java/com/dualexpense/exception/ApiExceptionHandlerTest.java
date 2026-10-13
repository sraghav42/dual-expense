package com.dualexpense.exception;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.http.HttpStatus;

@ExtendWith(OutputCaptureExtension.class)
class ApiExceptionHandlerTest {
    private final ApiExceptionHandler exceptionHandler = new ApiExceptionHandler();

    @Test
    void logsUnexpectedApiErrorsAndKeepsResponseGeneric(CapturedOutput output) {
        var response = exceptionHandler.handleUnexpected(new IllegalStateException("database unavailable"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).containsEntry("error", "Internal server error");
        assertThat(output.getAll())
            .contains("Unhandled API exception")
            .contains("java.lang.IllegalStateException: database unavailable");
    }
}

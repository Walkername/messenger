package ru.walkername.backend.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import ru.walkername.backend.auth.exception.AccountExistsException;
import ru.walkername.backend.auth.exception.AccountNotFoundException;
import ru.walkername.backend.auth.exception.InvalidCredentialsException;
import ru.walkername.backend.auth.exception.InvalidRefreshTokenException;
import ru.walkername.backend.auth.exception.RefreshTokenCookieNotFoundException;
import ru.walkername.backend.chat.exception.ChatNotFoundException;
import ru.walkername.backend.chat.exception.ChatParticipantAlreadyExistsException;
import ru.walkername.backend.common.dto.ErrorResponse;
import ru.walkername.backend.common.dto.ValidationErrorResponse;
import ru.walkername.backend.profile.exception.ProfileExistsException;
import ru.walkername.backend.profile.exception.ProfileNotFoundException;

import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler
    public ResponseEntity<ValidationErrorResponse> handleException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        FieldError::getDefaultMessage,
                        (existing, replacement) -> existing + "; " + replacement
                ));
        System.out.println(errors);
        ValidationErrorResponse response = new ValidationErrorResponse(
                "Validation error",
                errors,
                System.currentTimeMillis()
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler
    public ResponseEntity<ErrorResponse> handleException(InvalidJWTException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                ex.getMessage(),
                System.currentTimeMillis()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler
    public ResponseEntity<ErrorResponse> handleException(RefreshTokenCookieNotFoundException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                ex.getMessage(),
                System.currentTimeMillis()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler
    public ResponseEntity<ErrorResponse> handleException(WebSocketAccessDeniedException ex) {
        ErrorResponse response = new ErrorResponse(
                ex.getMessage(),
                System.currentTimeMillis()
        );
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler
    public ResponseEntity<ErrorResponse> handleException(AccountExistsException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                ex.getMessage(),
                System.currentTimeMillis()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler
    public ResponseEntity<ErrorResponse> handleException(AccountNotFoundException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                ex.getMessage(),
                System.currentTimeMillis()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler
    public ResponseEntity<ErrorResponse> handleException(InvalidCredentialsException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                ex.getMessage(),
                System.currentTimeMillis()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler
    public ResponseEntity<ErrorResponse> handleException(InvalidRefreshTokenException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                ex.getMessage(),
                System.currentTimeMillis()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler
    public ResponseEntity<ErrorResponse> handleException(ProfileExistsException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                ex.getMessage(),
                System.currentTimeMillis()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler
    public ResponseEntity<ErrorResponse> handleException(ProfileNotFoundException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                ex.getMessage(),
                System.currentTimeMillis()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler
    public ResponseEntity<ErrorResponse> handleException(ChatNotFoundException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                ex.getMessage(),
                System.currentTimeMillis()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler
    public ResponseEntity<ErrorResponse> handleException(ChatParticipantAlreadyExistsException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                ex.getMessage(),
                System.currentTimeMillis()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

}

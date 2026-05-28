package ru.walkername.backend.user.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.walkername.backend.user.dto.UpdateFirstNameRequest;
import ru.walkername.backend.user.dto.UserResponse;
import ru.walkername.backend.user.entity.User;
import ru.walkername.backend.user.mapper.UserMapper;
import ru.walkername.backend.user.service.UserService;

@RequiredArgsConstructor
@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> get(
            @PathVariable Long id
    ) {
        User user = userService.findOne(id);
        UserResponse userResponse = userMapper.toUserResponse(user);
        return new ResponseEntity<>(userResponse, HttpStatus.OK);
    }

    @PatchMapping("/{id}/firstname")
    public ResponseEntity<UserResponse> updateFirstName(
            @PathVariable Long id,
            @RequestBody UpdateFirstNameRequest request
    ) {
        String newFirstName = request.firstName();
        User user = userService.updateFirstName(id, newFirstName);
        UserResponse userResponse = userMapper.toUserResponse(user);
        return new ResponseEntity<>(userResponse, HttpStatus.OK);
    }

}

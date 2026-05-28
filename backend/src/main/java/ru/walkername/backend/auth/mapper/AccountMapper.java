package ru.walkername.backend.auth.mapper;

import org.mapstruct.Mapper;
import ru.walkername.backend.auth.dto.AccountResponse;
import ru.walkername.backend.auth.dto.AuthRequest;
import ru.walkername.backend.auth.entity.Account;

@Mapper(componentModel = "spring")
public interface AccountMapper {

    Account toAccount(AuthRequest authRequest);

    AccountResponse toAccountResponse(Account account);

}

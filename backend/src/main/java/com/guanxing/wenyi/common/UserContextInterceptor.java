package com.guanxing.wenyi.common;

import com.guanxing.wenyi.service.UserProfileService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;

/** 读取 X-User-Id 头（缺省 anonymous），解析/创建用户并写入 UserContext。 */
@Component
public class UserContextInterceptor implements HandlerInterceptor {

    public static final String HEADER = "X-User-Id";

    private final UserProfileService userProfileService;

    public UserContextInterceptor(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String externalId = request.getHeader(HEADER);
        if (!StringUtils.hasText(externalId)) {
            externalId = UserContext.ANONYMOUS;
        }
        String userId = userProfileService.resolveOrCreate(externalId);
        UserContext.set(userId, externalId);
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                               Object handler, Exception ex) {
        UserContext.clear();
    }
}

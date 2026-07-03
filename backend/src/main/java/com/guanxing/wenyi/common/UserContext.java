package com.guanxing.wenyi.common;

/** 当前请求的用户上下文（mock：来自 X-User-Id 头）。 */
public final class UserContext {

    public static final String ANONYMOUS = "anonymous";

    private static final ThreadLocal<String> USER_ID = new ThreadLocal<>();
    private static final ThreadLocal<String> EXTERNAL_ID = new ThreadLocal<>();

    private UserContext() {
    }

    public static void set(String userId, String externalId) {
        USER_ID.set(userId);
        EXTERNAL_ID.set(externalId);
    }

    /** 内部用户主键（user_profile.id）。 */
    public static String currentUserId() {
        return USER_ID.get();
    }

    /** 外部标识（X-User-Id）。 */
    public static String currentExternalId() {
        return EXTERNAL_ID.get();
    }

    public static void clear() {
        USER_ID.remove();
        EXTERNAL_ID.remove();
    }
}

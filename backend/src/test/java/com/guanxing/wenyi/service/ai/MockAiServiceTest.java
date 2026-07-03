package com.guanxing.wenyi.service.ai;

import com.guanxing.wenyi.service.voice.MockVoiceService;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** 纯单元测试：不加载 Spring 上下文，无需数据库/Redis，保证离线 mvn test 通过。 */
class MockAiServiceTest {

    private final MockAiService ai = new MockAiService();
    private final MockVoiceService voice = new MockVoiceService();

    @Test
    void refineQuestion_nonEmpty_returnsThree() {
        List<String> qs = ai.refineQuestion("这段关系，我该继续投入，还是先退一步？");
        assertEquals(3, qs.size());
        assertTrue(qs.get(0).contains("「"));
    }

    @Test
    void refineQuestion_empty_returnsTwo() {
        assertEquals(2, ai.refineQuestion("   ").size());
    }

    @Test
    void cast_returnsJianToGuan() {
        AiService.CastResult r = ai.cast("任意问题");
        assertEquals("风山渐", r.hexagram().name());
        assertEquals(6, r.hexagram().lines().size());
        assertEquals(List.of(3), r.changingLines());
        assertNotNull(r.changingTo());
        assertEquals("风地观", r.changingTo().name());
        assertFalse(r.poem().isBlank());
    }

    @Test
    void interpret_hasThreeSections() {
        AiService.ReadingResult reading = ai.interpret("这段关系该怎么走", "风山渐", "循序渐进", List.of(3), "风地观");
        assertFalse(reading.xiang().isBlank());
        assertFalse(reading.yi().isBlank());
        assertFalse(reading.xing().isBlank());
        assertFalse(reading.reflectQuestion().isBlank());
    }

    @Test
    void chatReply_cyclesStably() {
        AiService.ChatTurn u = new AiService.ChatTurn("user", "你好");
        AiService.ChatTurn a = new AiService.ChatTurn("assistant", "我在的");
        // 0 条与 4 条 user 历史应轮回到同一条固定回复
        assertEquals(ai.chatReply(List.of(), "今天有点累"),
                ai.chatReply(List.of(u, a, u, a, u, a, u, a), "今天有点累"));
        assertNotNull(ai.chatReply(List.of(u, a), "嗯"));
    }

    @Test
    void analyzeRelationship_returnsXian() {
        AiService.RelationshipResult r = ai.analyzeRelationship("双鱼", "天蝎");
        assertEquals("泽山咸", r.relationHexagram().name());
        assertFalse(r.attraction().isBlank());
        assertFalse(r.communication().isBlank());
    }

    @Test
    void voiceTranscribe_perContext() {
        assertTrue(voice.transcribe("journal").contains("松了一口气"));
        assertNotNull(voice.transcribe("ask"));
        assertEquals("mock", voice.providerName());
    }
}

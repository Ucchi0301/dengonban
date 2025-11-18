<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { supabase } from "../lib/supabaseClient";
import { onMounted, onBeforeUnmount } from "vue";

const route = useRoute();
const familyId = ref("");
const videoUrl = ref("");
const updatedAt = ref("");
let timer: number | null = null;
const videoRef = ref<HTMLVideoElement | null>(null);
const isPlaying = ref(false);
const uploadedByName = ref("");

function togglePlay() {
  if (!videoRef.value) return;

  if (isPlaying.value) {
    // 停止
    videoRef.value.pause();
    videoRef.value.muted = true;
    isPlaying.value = false;
  } else {
    // 再生
    videoRef.value.muted = false;
    videoRef.value.play();
    isPlaying.value = true;
  }
}
onMounted(() => {
  // 20分ごと（1200000ms）
  timer = setInterval(async () => {
    if (!familyId.value) return;

    // 最新の updated_at を取得
    const { data: msg } = await supabase
      .from("message")
      .select("updated_at")
      .eq("family_id", familyId.value)
      .single();

    // 変更があれば更新！
    if (msg?.updated_at && msg.updated_at !== updatedAt.value) {
      updatedAt.value = msg.updated_at;

      // 最新動画のURLを取り直す
      const { data } = supabase.storage
        .from("videos")
        .getPublicUrl(`${familyId.value}/latest.mp4`);

      videoUrl.value = data.publicUrl;
    }
  }, 1200000); // ← ここが20分

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && videoRef.value) {
      videoRef.value.pause();
      videoRef.value.muted = true; // ついでにミュートへ戻す
      isPlaying.value = false;
    }
  });
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});

watch(
  () => route.query.family_id,
  async (id) => {
    if (typeof id === "string") {
      familyId.value = id;

      // 動画URL取得
      const { data } = supabase.storage
        .from("videos")
        .getPublicUrl(`${familyId.value}/latest.mp4`);
      videoUrl.value = data.publicUrl;

      // message取得
      const { data: msg } = await supabase
        .from("message")
        .select("updated_at, uploaded_by")
        .eq("family_id", familyId.value)
        .single();

      updatedAt.value = msg?.updated_at ?? "";

      // 投稿者名を profiles から取得
      if (msg?.uploaded_by) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", msg.uploaded_by)
          .single();

        uploadedByName.value = profile?.name ?? "";
      }
    }
  },
  { immediate: true }
);
function formatDate(isoString: string | null) {
  if (!isoString) return "";

  const date = new Date(isoString);

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = weekdays[date.getDay()];
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");

  return `${month}月${day}日（${weekday}） ${hour}:${minute}`;
}
</script>

<template>
  <div
    class="h-screen overflow-hidden flex flex-col bg-[#fff9f2] text-gray-900"
  >
    <!-- 上：大きいタイトルエリア（優しいベージュ） -->
    <div
      class="flex-none w-full py-10 bg-[#fff3e2] text-center border-b-8 border-[#ffe0b3] shadow-md"
    >
      <!-- 名前を強調（背景色 / 太字 / 大きい文字） -->
      <h1 class="text-4xl font-extrabold text-gray-900 tracking-wide">
        <span class="bg-yellow-300 text-6xl px-4 py-1 rounded-md">
          {{ uploadedByName }} </span
        >さんからの
        <span class="block mt-4 text-3xl text-gray-800"> 伝言があります </span>
      </h1>

      <!-- 更新日時 -->
      <p class="text-gray-700 text-2xl mt-6 font-semibold">
        {{ formatDate(updatedAt) }}
      </p>
    </div>

    <!-- 中央：動画（やさしい背景） -->
    <div
      class="flex-1 flex items-center justify-center overflow-hidden bg-[#fff9f2]"
    >
      <video
        v-if="videoUrl"
        ref="videoRef"
        :src="videoUrl"
        class="w-full h-full object-cover rounded-lg"
        loop
        playsinline
        muted
      ></video>

      <p v-else class="text-center text-lg text-gray-500">
        動画がまだありません。
      </p>
    </div>

    <!-- 下：巨大メッセージボタン（赤×黄色で視認性高い） -->
    <button
      v-if="videoUrl"
      @click="togglePlay"
      class="flex-none w-full py-10 text-6xl font-extrabold bg-red-600 text-yellow-300 border-t-8 border-yellow-400 shadow-xl transition-all duration-300"
      :class="{
        'animate-small-bounce': !isPlaying,
      }"
    >
      {{ isPlaying ? "⏸ 止める" : "▶ ここを押す" }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { supabase } from "../lib/supabaseClient";
import QRCode from "qrcode";

const userName = ref("");
const familyId = ref("");
const familyUrl = ref("");
const seniorQr = ref("");
const familyQr = ref("");

const copied = ref(false);

// 折りたたみの状態
const openFamily = ref(false);
const openSenior = ref(false);

onMounted(async () => {
  const uid = localStorage.getItem("uid");
  if (!uid) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, family_id")
    .eq("id", uid)
    .single();

  userName.value = profile?.name ?? "";
  familyId.value = profile?.family_id ?? "";

  // 家族がJOINするURL
  familyUrl.value = `${window.location.origin}/?family_id=${familyId.value}`;

  // 家族用QR（JOINページ）
  familyQr.value = await QRCode.toDataURL(familyUrl.value);

  // シニア向けURL
  const seniorUrl = `${window.location.origin}/view?family_id=${familyId.value}`;

  // シニア用QR
  seniorQr.value = await QRCode.toDataURL(seniorUrl);
});

// URLコピー
const copyUrl = async () => {
  await navigator.clipboard.writeText(familyUrl.value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 1200);
};
</script>

<template>
  <div
    class="h-screen overflow-y-auto bg-[#fff9f2] text-gray-900 p-6 flex flex-col gap-8"
  >
    <!-- タイトル -->
    <h1 class="text-3xl font-bold text-center mb-4">管理画面</h1>

    <!-- ユーザー情報カード -->
    <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-[#ffe0b3]">
      <p class="text-2xl font-bold mb-2">こんにちは、{{ userName }} さん</p>
      <p class="text-gray-600 text-lg mb-4">家族ID: {{ familyId }}</p>

      <p class="font-semibold mb-1">家族に渡すURL:</p>
      <div
        class="bg-gray-100 rounded p-3 break-all text-gray-700 border border-gray-300"
      >
        {{ familyUrl }}
      </div>

      <button
        @click="copyUrl"
        class="mt-3 px-4 py-2 rounded-lg shadow text-white font-bold transition-all duration-300"
        :class="
          copied ? 'bg-green-600 scale-105' : 'bg-blue-600 hover:bg-blue-700'
        "
      >
        <span v-if="copied">✔ コピーしました！</span>
        <span v-else>URLをコピー</span>
      </button>
    </div>

    <!-- 📌 家族用QRコード（折りたたみ） -->
    <div class="bg-white rounded-xl shadow-lg border-2 border-[#ffe0b3]">
      <button
        @click="openFamily = !openFamily"
        class="w-full text-left p-4 text-xl font-bold bg-[#fff3e2] border-b text-gray-800"
      >
        家族用QRコード
        <span class="float-right">{{ openFamily ? "▲" : "▼" }}</span>
      </button>

      <div v-if="openFamily" class="p-6 text-center">
        <img
          :src="familyQr"
          class="w-64 h-64 mx-auto bg-white p-4 rounded shadow"
        />
        <p class="text-gray-600 mt-3 text-lg">家族が参加するためのQRです</p>
      </div>
    </div>

    <!-- 👴 シニア用QRコード（折りたたみ） -->
    <div class="bg-white rounded-xl shadow-lg border-2 border-[#ffe0b3]">
      <button
        @click="openSenior = !openSenior"
        class="w-full text-left p-4 text-xl font-bold bg-[#fff3e2] border-b text-gray-800"
      >
        シニア用QRコード
        <span class="float-right">{{ openSenior ? "▲" : "▼" }}</span>
      </button>

      <div v-if="openSenior" class="p-6 text-center">
        <img
          :src="seniorQr"
          class="w-64 h-64 mx-auto bg-white p-4 rounded shadow"
        />
        <p class="text-gray-600 mt-3 text-lg">シニアが動画を見るためのQRです</p>
      </div>
    </div>

    <!-- 動画アップロード -->
    <button
      @click="$router.push('/upload')"
      class="bg-green-600 text-white text-xl font-bold py-4 rounded-lg shadow-lg"
    >
      📤 動画をアップロードする
    </button>

    <!-- ログアウト -->
    <button
      @click="
        supabase.auth.signOut().then(() => {
          // @ts-ignore
          localStorage.clear();
          // @ts-ignore
          location.href = '/login';
        })
      "
      class="bg-red-600 text-white py-3 rounded-lg shadow mb-10"
    >
      ログアウト
    </button>
  </div>
</template>

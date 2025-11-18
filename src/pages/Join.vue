// @ts-ignore

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { supabase } from "../lib/supabaseClient";

const route = useRoute();
const router = useRouter();

const name = ref("");
const familyId = ref("");

onMounted(() => {
  familyId.value = route.query.family_id as string;
});

const handleRegister = async () => {
  if (!name.value) return alert("名前を入力してください");

  // 匿名ログイン
  const { data: authData, error } = await supabase.auth.signInAnonymously();
  if (error) return alert(error.message);

  const userId = authData.user.id;

  // profilesに登録（ここでfamily_idも一緒に保存）
  const { error: insertErr } = await supabase.from("profiles").insert({
    id: userId,
    name: name.value,
    role: "member",
    family_id: familyId.value,
  });

  if (insertErr) {
    console.error(insertErr);
    return alert("登録エラー：" + insertErr.message);
  }

  localStorage.setItem("uid", userId);
  router.push("/upload");
};
</script>

<template>
  <div class="min-h-screen bg-[#fff9f2] flex flex-col justify-center px-6">
    <div
      class="bg-white rounded-2xl shadow-xl p-8 border-2 border-[#ffe0b3] max-w-md mx-auto w-full"
    >
      <!-- タイトル -->
      <h1 class="text-3xl font-extrabold text-center text-gray-800 mb-2">
        家族登録
      </h1>
      <p class="text-center text-gray-600 mb-6">
        あなたのお名前を入力してください
      </p>

      <!-- 入力欄 -->
      <input
        v-model="name"
        type="text"
        placeholder="お名前"
        class="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-[#ffe0b3] focus:border-[#ffcf78] text-lg transition"
      />

      <!-- ボタン -->
      <button
        @click="handleRegister"
        class="w-full mt-6 bg-blue-600 text-white py-3 text-xl font-bold rounded-xl shadow-lg transition transform hover:scale-[1.02] hover:bg-blue-700"
      >
        はじめる
      </button>
    </div>
  </div>
</template>

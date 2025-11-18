// @ts-ignore

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const familyId = route.query.family_id;

// family_id がある → 高齢者ビューへ
if (familyId) {
  router.replace(`/view?family_id=${familyId}`);
} else {
  // family_id がない → 管理画面 or ログイン
  const uid = localStorage.getItem("uid");

  if (uid) {
    router.replace("/dashboard");
  } else {
    router.replace("/login");
  }
}
</script>

<template>
  <div class="p-6 text-center">
    読み込み中…
  </div>
</template>

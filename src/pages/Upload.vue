// @ts-ignore

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "vue-router";
const file = ref<File | null>(null);
const uploading = ref(false);
const router = useRouter();
const seniorUrl = ref("");
const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files?.length) {
    // @ts-ignore

    file.value = target.files[0];
  }
};

onMounted(async () => {
  const uid = localStorage.getItem("uid");
  if (!uid) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("family_id")
    .eq("id", uid)
    .single();

  if (profile?.family_id) {
    seniorUrl.value = `/view?family_id=${profile.family_id}`;
  }
});

// シニアページに飛ぶ
const goSenior = () => {
  if (!seniorUrl.value) return alert("family_id 取得に失敗しました");
  router.push(seniorUrl.value);
};

const uploadVideo = async () => {
  if (!file.value) return alert("動画を選択してください");
  uploading.value = true;

  const uid = localStorage.getItem("uid");
  if (!uid) return alert("ログイン情報がありません");

  // 自分の family_id 取得
  const { data: profile } = await supabase
    .from("profiles")
    .select("family_id")
    .eq("id", uid)
    .single();
  // @ts-ignore

  const fam = profile.family_id;

  // Storage パス
  const path = `${fam}/latest.mp4`;

  // アップロード（上書き許可）
  const { error: uploadErr } = await supabase.storage
    .from("videos")
    .upload(path, file.value, {
      upsert: true,
      contentType: "video/mp4",
    });

  if (uploadErr) {
    uploading.value = false;
    return alert("アップロード失敗：" + uploadErr.message);
  }

  // message が存在するかチェック
  const { data: existing } = await supabase
    .from("message")
    .select("id")
    .eq("family_id", fam)
    .maybeSingle();

  if (!existing) {
    // なければ作成
    await supabase.from("message").insert({
      family_id: fam,
      updated_at: new Date().toISOString(),
      uploaded_by: uid,
    });
  } else {
    // あれば更新
    await supabase
      .from("message")
      .update({
        updated_at: new Date().toISOString(),
        uploaded_by: uid,
      })
      .eq("family_id", fam);
  }

  uploading.value = false;
  alert("アップロード成功！");
};
</script>

<template>
  <div class="min-h-screen bg-[#fff9f2] text-gray-900 p-6 flex flex-col gap-8">
    <!-- タイトル -->
    <h1 class="text-3xl font-bold text-center">動画アップロード</h1>

    <!-- アップロードカード -->
    <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-[#ffe0b3]">
      <p class="text-lg mb-4">
        伝言したい動画をアップロードすると、自動でシニアページに反映されます。
      </p>

      <!-- ファイル選択 -->
      <div class="flex flex-col gap-3">
        <label class="font-bold text-lg">📂 動画を選択</label>
        <input
          type="file"
          accept="video/*"
          @change="handleFileChange"
          class="bg-gray-100 p-3 rounded border border-gray-300"
        />
      </div>

      <!-- アップロードボタン -->
      <button
        @click="uploadVideo"
        class="mt-6 bg-green-600 text-white w-full py-4 rounded-lg text-xl font-bold shadow hover:bg-green-700 transition"
        :disabled="uploading"
      >
        {{ uploading ? "アップロード中…" : "📤 アップロードする" }}
      </button>
    </div>

    <!-- シニアページへ -->
    <button
      @click="goSenior"
      class="bg-blue-600 text-white py-4 rounded-lg text-xl font-bold shadow-lg hover:bg-blue-700 transition"
    >
      👴 シニアページを確認する
    </button>
  </div>
</template>

import { createRouter, createWebHistory } from "vue-router";

import Join from "./pages/Join.vue";
import Upload from "./pages/Upload.vue";
import SeniorView from "./pages/View.vue";
import Dashboard from "./pages/Dashboard.vue";
import HomeRedirect from "./pages/HomeRedirect.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: HomeRedirect },
    { path: "/join", component: Join },
    { path: "/upload", component: Upload },
    { path: "/view", component: SeniorView },
    { path: "/Dashboard", component: Dashboard },

  ],
});

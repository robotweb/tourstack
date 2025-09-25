<template>
  <div class="min-h-screen flex bg-gray-50">
    <!-- Wrapper provides hover context for 'hover' mode -->
    <div class="hidden md:flex md:flex-col" :class="sidebarWrapperClass">
      <!-- Sidebar (desktop) -->
      <aside
        class="md:flex md:flex-col md:border-r md:border-gray-200 md:bg-white md:p-4 md:h-screen transition-[width] duration-200 ease-in-out"
        :class="sidebarWidthClass"
      >
        <div class="flex items-center justify-between h-12 shrink-0">
          <NuxtLink :to="'/' + (clientUid || '')" class="text-lg font-semibold truncate flex items-center gap-2">
            <!-- Placeholder for collapsed logo space; will be replaced later -->
            <!-- <span class="block w-6 h-6 flex-none"></span>
            <span class="sidebar-text">TourStack</span> -->
          </NuxtLink>
        </div>
        <nav class="flex-1 flex flex-col gap-1">
          <!-- <NuxtLink :to="'/' + clientUid" class="px-3 py-2 rounded hover:bg-gray-100 truncate flex items-center gap-3" exact-active-class="bg-gray-100 font-medium">
            <Icons name="home" class="h-5 w-5 text-gray-600 flex-none" />
            <span class="sidebar-text">Dashboard</span>
          </NuxtLink> -->
          <NuxtLink
            v-for="item in menuItems"
            :key="item.to"
            :to="item.to"
            class="h-9 rounded flex items-center text-sm whitespace-nowrap overflow-hidden px-1 gap-2"
            :class="[ linkPaddingAdjustClass, { 'hover:bg-gray-100': sidebarMode !== 'collapsed' } ]"
            active-class="bg-gray-100 font-medium"
          >
            <div class="w-6 flex items-center justify-center flex-none">
              <Icons :name="item.icon" class="h-5 w-5 text-gray-600" />
            </div>
            <span :class="labelClass" class="transition-[max-width,opacity] duration-200 ease-in-out overflow-hidden">{{ item.label }}</span>
          </NuxtLink>
        </nav>
        <div class="mt-auto flex items-center justify-between gap-2">
          <Popover>
            <PopoverTrigger as-child>
              <Button variant="outline" size="icon" aria-label="Sidebar control">
                <Icons name="settings-2" class="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" class="w-56">
                <div class="text-sm font-semibold mb-2">Sidebar control</div>
                <div class="flex flex-col">
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="sidebar-mode" value="hover" v-model="sidebarMode" />
                    <span class="text-sm">Expand on hover</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="sidebar-mode" value="expanded" v-model="sidebarMode" />
                    <span class="text-sm">Expanded</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="sidebar-mode" value="collapsed" v-model="sidebarMode" />
                    <span class="text-sm">Collapsed</span>
                  </label>
                </div>
            </PopoverContent>
          </Popover>
        </div>
      </aside>

      <!-- Removed external controller block; controller now lives in sidebar footer -->
    </div>

    <!-- Content area -->
    <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
      <!-- Top bar (desktop) -->
      <header class="hidden md:block sticky top-0 z-20 bg-white border-b border-gray-200">
        <div class="flex items-center justify-end h-14 px-4">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="icon" aria-label="User">
                <Icons name="user" class="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-56 mr-2">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem v-for="item in userMenuItems" :key="item.to" :as-child="true">
                <NuxtLink :to="item.to" class="flex items-center gap-2">
                  <Icons :name="item.icon" class="h-4 w-4" />
                  <span>{{ item.label }}</span>
                </NuxtLink>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem :as-child="true">
                <Logout>
                  <div class="flex items-center gap-2">
                    <Icons name="log-out" class="h-4 w-4" />
                    <span>Logout</span>
                  </div>
                </Logout>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <!-- Main content -->
      <main class="p-4 flex-1 overflow-y-auto min-h-0">
        <slot />
      </main>
    </div>
  </div>
</template>

<script>
export default {
  data(){
    return {
      sidebarMode: 'hover' // 'hover' | 'expanded' | 'collapsed'
    }
  },
  computed: {
    clientUid() {
      return this.$route?.params?.team || ''
    },
    menuItems(){
      const base = '/' + this.clientUid
      return [
        { label: 'Bookings', to: base + '', icon: 'calendar' },
        { label: 'Services', to: base + '/service', icon: 'hand-platter' },
        { label: 'Vehicles', to: base + '/vehicle', icon: 'car-taxi-front' },
        { label: 'Packages', to: base + '/package', icon: 'package' },
        { label: 'Customers', to: base + '/customer', icon: 'users' },
      ]
    },
    userMenuItems(){
      const base = '/' + this.clientUid
      return [
        { label: 'Profile', to: base + '/profile', icon: 'user' },
        { label: 'Team', to: base + '/team', icon: 'users' },
        { label: 'Billing', to: base + '/billing', icon: 'credit-card' },
        { label: 'Settings', to: base + '/settings', icon: 'settings' },
      ]
    },
    sidebarWrapperClass(){
      // provide group on hover mode for width expansion
      return this.sidebarMode === 'hover' ? 'group' : ''
    },
    sidebarWidthClass(){
      if (this.sidebarMode === 'expanded') return 'md:w-60';
      if (this.sidebarMode === 'collapsed') return 'md:w-16';
      // hover mode: collapsed by default, expand on hover
      return 'md:w-16 group-hover:md:w-60';
    },
    labelClass(){
      // control label reveal without moving the icon
      if (this.sidebarMode === 'expanded') return 'max-w-[200px] opacity-100';
      if (this.sidebarMode === 'collapsed') return 'max-w-0 opacity-0';
      // hover mode: hidden by default, reveal on hover
      return 'max-w-0 opacity-0 group-hover:max-w-[200px] group-hover:opacity-100';
    },
    linkPaddingAdjustClass(){
      // Keep padding constant so the icon doesn't shift horizontally
      if (this.sidebarMode === 'collapsed') return 'pl-1 pr-1';
      // Expanded already has base px-1 from the link class
      if (this.sidebarMode === 'expanded') return '';
      // Hover mode: keep constant padding to avoid movement
      return '';
    },
    iconWrapperClass(){
      if (this.sidebarMode === 'collapsed') return 'w-full';
      return 'w-6';
    }
  },
  mounted(){
    const saved = localStorage.getItem('sidebarMode');
    if (saved) this.sidebarMode = saved;
    // initialize text visibility based on mode
    this.updateTextVisibility(this.sidebarMode);
  },
  watch: {
    sidebarMode(val){
      localStorage.setItem('sidebarMode', val);
      this.updateTextVisibility(val);
    }
  },
  methods: {
    updateTextVisibility(val){
      // No-op: label visibility is now handled purely via classes
    }
  }
}
</script>

<style scoped>
/* Ensure text hides when sidebar is narrow via JS toggle; icons remain visible */
/* Labels animate width/opacity; icons remain fixed */
</style>

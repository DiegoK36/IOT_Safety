export const state = () => ({
  auth: null,
  devices: [],
  selectedDevice: {},
  notifications: [],
});

/*

  $$\      $$\             $$\                         $$\                                         
  $$$\    $$$ |            $$ |                        \__|                                        
  $$$$\  $$$$ |$$\   $$\ $$$$$$\    $$$$$$\   $$$$$$$\ $$\  $$$$$$\  $$$$$$$\   $$$$$$\   $$$$$$$\ 
  $$\$$\$$ $$ |$$ |  $$ |\_$$  _|   \____$$\ $$  _____|$$ |$$  __$$\ $$  __$$\ $$  __$$\ $$  _____|
  $$ \$$$  $$ |$$ |  $$ |  $$ |     $$$$$$$ |$$ /      $$ |$$ /  $$ |$$ |  $$ |$$$$$$$$ |\$$$$$$\  
  $$ |\$  /$$ |$$ |  $$ |  $$ |$$\ $$  __$$ |$$ |      $$ |$$ |  $$ |$$ |  $$ |$$   ____| \____$$\ 
  $$ | \_/ $$ |\$$$$$$  |  \$$$$  |\$$$$$$$ |\$$$$$$$\ $$ |\$$$$$$  |$$ |  $$ |\$$$$$$$\ $$$$$$$  |
  \__|     \__| \______/    \____/  \_______| \_______|\__| \______/ \__|  \__| \_______|\_______/                                                                                                                                                                                           
                                                                                                 
  */

export const mutations = {
  setAuth(state, auth) {
    state.auth = auth;
  },

  setNotifications(state, notifications) {
    state.notifications = notifications;
  },

  setDevices(state, devices) {
    state.devices = devices;
  },

  setSelectedDevice(state, device) {
    state.selectedDevice = device;
  },
};

/*
  
   $$$$$$\                      $$\                                         
  $$  __$$\                     \__|                                        
  $$ /  $$ | $$$$$$$\  $$$$$$$\ $$\  $$$$$$\  $$$$$$$\   $$$$$$\   $$$$$$$\ 
  $$$$$$$$ |$$  _____|$$  _____|$$ |$$  __$$\ $$  __$$\ $$  __$$\ $$  _____|
  $$  __$$ |$$ /      $$ /      $$ |$$ /  $$ |$$ |  $$ |$$$$$$$$ |\$$$$$$\  
  $$ |  $$ |$$ |      $$ |      $$ |$$ |  $$ |$$ |  $$ |$$   ____| \____$$\ 
  $$ |  $$ |\$$$$$$$\ \$$$$$$$\ $$ |\$$$$$$  |$$ |  $$ |\$$$$$$$\ $$$$$$$  |
  \__|  \__| \_______| \_______|\__| \______/ \__|  \__| \_______|\_______/ 
                                                                                                                                              
  */

export const actions = {
  readToken() {
    let auth = null;
    try {
      if (process.browser) {
        auth = JSON.parse(localStorage.getItem("auth"));
      }
    } catch (error) {
      console.log(error);
    }
    // Guardamos en Auth en State
    this.commit("setAuth", auth);
  },

  getDevices() {
    const axiosHeader = {
      headers: {
        token: this.state.auth.token,
      },
    };

    this.$axios
      .get("/dispositivos", axiosHeader)
      .then((res) => {
        console.log(res.data.data);

        res.data.data.forEach((device, index) => {
          if (device.selected) {
            this.commit("setSelectedDevice", device);
            $nuxt.$emit("selectedDeviceIndex", index);
          }
        });

        // Si todos los dispositivos han sido borrados
        if (res.data.data.length == 0) {
          this.commit("setSelectedDevice", {});
          $nuxt.$emit("selectedDeviceIndex", null);
        }

        this.commit("setDevices", res.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  },

  getNotifications() {
    const axiosHeader = {
      headers: {
        token: this.state.auth.token,
      },
    };

    this.$axios
      .get("/notificaciones", axiosHeader)
      .then((res) => {
        console.log(res.data.data);
        this.commit("setNotifications", res.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  },
};

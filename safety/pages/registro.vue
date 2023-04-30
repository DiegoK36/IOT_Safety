<template>
    <div class="container login-page">
      <div class="col-lg-4 col-md-6 ml-auto mr-auto">
        <card class="card-login card-white">
          <template slot="header">
            <img src="" alt="" />
            <h1 class="card-title">Safety APP</h1>
          </template>
  
          <div>
            <base-input
              name="name"
              v-model="user.name"
              placeholder="Nombre"
              addon-left-icon="tim-icons icon-badge"
            >
            </base-input>
  
            <base-input
              name="email"
              v-model="user.email"
              placeholder="Correo"
              addon-left-icon="tim-icons icon-email-85"
            >
            </base-input>
  
            <base-input
              name="password"
              v-model="user.password"
              type="password"
              placeholder="Contraseña"
              addon-left-icon="tim-icons icon-lock-circle"
            >
            </base-input>
          </div>
  
          <div slot="footer">
            <base-button
              native-type="submit"
              type="danger"
              class="mb-3"
              size="lg"
              @click="register"
              block
            >
              Registrarse
            </base-button>
  
            <div class="pull-left">
              <h6>
                <nuxt-link class="link footer-link" to="/login">
                  Iniciar Sesión
                </nuxt-link>
              </h6>
            </div>
  
            <div class="pull-right">
              <h6><a href="#help!!!" class="link footer-link">Ayuda</a></h6>
            </div>
          </div>
        </card>
      </div>
    </div>
  </template>
  <script>
  export default {
    layout: "auth",
    data() {
      return {
        user: {
          name: "",
          email: "",
          password: ""
        }
      };
    },
    methods: {}
  };
  </script>
  <style>
  .navbar-nav .nav-item p {
    line-height: inherit;
    margin-left: 5px;
  }
  </style>
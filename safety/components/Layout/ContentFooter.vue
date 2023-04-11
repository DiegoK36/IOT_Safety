<template>
  <footer class="footer">
    <div class="container-fluid">
      <ul class="nav">
        <li class="nav-item">
          <a
            target="_blank"
            rel="noopener"
            class="nav-link"
          >
            Safety
          </a>
        </li>
        <li class="nav-item">
          <a
            target="_blank"
            rel="noopener"
            class="nav-link"
          >
            Sobre Nosotros
          </a>
        </li>
        <li class="nav-item">
          <a
            href="https://universidadeuropea.com/"
            target="_blank"
            rel="noopener"
            class="nav-link"
          >
            UEM
          </a>
        </li>
      </ul>
      <div class="copyright">
        &copy; {{ year }}, Diseñado por el 
        
        <a
          style="color:#C733FF;"
          target="_blank"
          rel="noopener"
          >Equipo Safety</a
        >

      </div>
    </div>
  </footer>
</template>
<script>
export default {
  data() {
    return {
      year: new Date().getFullYear()
    };
  }
};
</script>
<style></style>

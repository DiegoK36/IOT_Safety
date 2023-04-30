// Si el usuario no tiene token lo enviamos al Login
export default function({ store, redirect }) {
    
    store.dispatch("readToken");
  
    if (!store.state.auth) {
      return redirect("/login");
    }
}
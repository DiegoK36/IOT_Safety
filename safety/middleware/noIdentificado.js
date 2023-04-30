// Si el usuario tiene token lo enviamos a DashBoard
export default function({ store, redirect }) {
    store.dispatch('readToken');
    
    if (store.state.auth) {
        return redirect('/dashboard')
    }
} 
<script setup>
const { user } = useAuth()
onMounted(() => {
  if (!user.value || user.value.role !== 'admin') {
    navigateTo('/')
  }
})

const { data: forums, refresh } = useFetch('/api/forums')

const newAdmin = ref({ username: '', password: '' })
const forumForm = ref({ id: null, title: '', description: '', action: 'create' })
const dialogForum = ref(false)

const handleAdminCreate = async () => {
  try {
    await $fetch('/api/admin/create-admin', { method: 'POST', body: newAdmin.value })
    alert('Nouvel administrateur créé !')
    newAdmin.value = { username: '', password: '' }
  } catch (e) { alert(e.data.message) }
}

const openForumDialog = (forum = null) => {
  if (forum) {
    forumForm.value = { id: forum.id, title: forum.title, description: forum.description, action: 'rename' }
  } else {
    forumForm.value = { id: null, title: '', description: '', action: 'create' }
  }
  dialogForum.value = true
}

const saveForum = async () => {
  try {
    await $fetch('/api/admin/forums', { method: 'POST', body: forumForm.value })
    dialogForum.value = false
    refresh()
  } catch (e) { alert('Erreur') }
}

const deleteForum = async (id) => {
  if (!confirm("Voulez-vous supprimer ce forum ? TOUS les sujets et messages seront perdus !")) return
  await $fetch('/api/admin/forums', { method: 'POST', body: { action: 'delete', id } })
  refresh()
}
</script>

<template>
  <v-container max-width="1000">
    <h1 class="text-h4 font-weight-bold mb-6 text-primary">Espace Administration</h1>

    <v-row>
      <v-col cols="12" md="8">
        <v-card elevation="2">
          <v-card-title class="d-flex justify-space-between align-center pa-4">
            Gestion des Forums
            <v-btn color="success" prepend-icon="mdi-plus" size="small" @click="openForumDialog()">Ajouter</v-btn>
          </v-card-title>
          <v-divider></v-divider>
          <v-list lines="two">
            <v-list-item v-for="f in forums" :key="f.id">
              <v-list-item-title class="font-weight-bold">{{ f.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ f.description }}</v-list-item-subtitle>
              <template v-slot:append>
                <v-btn icon="mdi-pencil" variant="text" color="primary" @click="openForumDialog(f)"></v-btn>
                <v-btn icon="mdi-delete" variant="text" color="error" @click="deleteForum(f.id)"></v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card elevation="2" class="pa-4">
          <v-card-title class="px-0 mb-4">Créer un Administrateur</v-card-title>
          <v-form @submit.prevent="handleAdminCreate">
            <v-text-field v-model="newAdmin.username" label="Pseudo" variant="outlined" density="compact"></v-text-field>
            <v-text-field v-model="newAdmin.password" label="Mot de passe" type="password" variant="outlined" density="compact"></v-text-field>
            <v-btn type="submit" color="primary" block>Créer l'admin</v-btn>
          </v-form>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialogForum" max-width="500">
      <v-card>
        <v-card-title class="bg-primary text-white">{{ forumForm.action === 'create' ? 'Nouveau Forum' : 'Modifier le Forum' }}</v-card-title>
        <v-card-text class="pa-4">
          <v-text-field v-model="forumForm.title" label="Titre" variant="outlined"></v-text-field>
          <v-textarea v-model="forumForm.description" label="Description" variant="outlined" rows="3"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialogForum = false">Annuler</v-btn>
          <v-btn color="primary" variant="flat" @click="saveForum">Enregistrer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
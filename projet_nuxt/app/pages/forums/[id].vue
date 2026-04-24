<script setup>
const route = useRoute()
const forumId = route.params.id

const { data, pending } = useFetch(`/api/forums/${forumId}`)

const formatDate = (dateString) => {
  if (!dateString) return 'Aucun message'
  return new Date(dateString).toLocaleString('fr-FR', { 
    day: '2-digit', month: '2-digit', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  })
}
</script>

<template>
  <v-container max-width="1000">
    <v-btn variant="text" prepend-icon="mdi-arrow-left" to="/" class="mb-4">
      Retour aux forums
    </v-btn>

    <v-card v-if="pending" class="pa-5 text-center" elevation="0">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-card>

    <div v-else-if="data">
      <v-row class="mb-4" align="center" justify="space-between">
        <v-col>
          <h1 class="text-h4 font-weight-bold text-primary">{{ data.forum.title }}</h1>
          <p class="text-subtitle-1 text-grey-darken-1">{{ data.forum.description }}</p>
        </v-col>
        <v-col class="text-right">
          <v-btn color="primary" prepend-icon="mdi-plus">Créer un sujet</v-btn>
        </v-col>
      </v-row>

      <v-card elevation="2">
        <v-list lines="two">
          <v-list-item v-if="data.subjects.length === 0" class="text-center pa-4 text-grey">
            Aucun sujet dans ce forum pour le moment. Soyez le premier !
          </v-list-item>

          <template v-for="(subject, index) in data.subjects" :key="subject.id">
            <v-list-item :to="`/subjects/${subject.id}`" hover>
              <template v-slot:prepend>
                <v-icon icon="mdi-message-text" color="primary" size="large" class="mr-4"></v-icon>
              </template>

              <v-list-item-title class="text-h6 font-weight-medium">
                {{ subject.title }}
              </v-list-item-title>
              <v-list-item-subtitle>
                Par <strong>{{ subject.author }}</strong> le {{ formatDate(subject.subject_date) }}
              </v-list-item-subtitle>

              <template v-slot:append>
                <div class="text-right text-caption text-grey-darken-1" style="min-width: 150px;">
                  <v-icon icon="mdi-clock-outline" size="small" class="mr-1"></v-icon>
                  Dernier message :<br>
                  <strong v-if="subject.last_message_author">{{ subject.last_message_author }}</strong>
                  <span v-else>Personne</span>
                  <br>
                  {{ formatDate(subject.last_message_date || subject.subject_date) }}
                </div>
              </template>
            </v-list-item>
            
            <v-divider v-if="index < data.subjects.length - 1"></v-divider>
          </template>
        </v-list>
      </v-card>
    </div>
  </v-container>
</template>
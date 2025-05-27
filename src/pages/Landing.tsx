import { Link } from "react-router-dom"
import { Rocket, Bell, Users, Calendar, Brain, BarChart, Timer, Shield, LogIn, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"

const Landing = () => {
  // Vérifier si l'utilisateur est déjà connecté
  const isAuthenticated = !!localStorage.getItem("access_token")

  const features = [
    {
      icon: <Brain className="h-7 w-7 text-white" />,
      title: "Organisation intelligente",
      description: "Laissez notre intelligence artificielle organiser vos journées selon vos priorités.",
      bgGradient: "from-purple-500 to-pink-500",
    },
    {
      icon: <Bell className="h-7 w-7 text-white" />,
      title: "Rappels personnalisés",
      description: "Recevez des notifications au bon moment pour ne jamais oublier une tâche importante.",
      bgGradient: "from-purple-600 to-pink-600",
    },
    {
      icon: <Users className="h-7 w-7 text-white" />,
      title: "Collaboration facile",
      description: "Travaillez en équipe, partagez les tâches et avancez ensemble, où que vous soyez.",
      bgGradient: "from-purple-700 to-pink-700",
    },
    {
      icon: <Calendar className="h-7 w-7 text-white" />,
      title: "Planning automatique",
      description: "Un emploi du temps optimisé rien que pour vous, ajusté en temps réel à vos changements.",
      bgGradient: "from-purple-500 to-pink-400",
    },
    {
      icon: <Timer className="h-7 w-7 text-white" />,
      title: "Gagnez du temps",
      description: "Passez moins de temps à planifier, plus de temps à agir.",
      bgGradient: "from-purple-600 to-pink-500",
    },
    {
      icon: <Shield className="h-7 w-7 text-white" />,
      title: "Sécurité maximale",
      description: "Vos données personnelles et professionnelles sont protégées par des technologies de pointe.",
      bgGradient: "from-purple-700 to-pink-600",
    },
  ]

  const benefits = [
    {
      emoji: "💡",
      title: "Planification intelligente",
      description: "Votre planning se construit tout seul grâce à l'IA",
    },
    {
      emoji: "⏰",
      title: "Notifications automatiques",
      description: "Plus besoin de penser aux rappels, on s'en charge pour vous",
    },
    {
      emoji: "👨‍👩‍👧‍👦",
      title: "Travail d'équipe fluide",
      description: "Répartissez les tâches efficacement dans vos groupes",
    },
    {
      emoji: "📱",
      title: "Accessibilité",
      description: "Gérez vos tâches depuis n'importe quel appareil",
    },
    {
      emoji: "🔄",
      title: "Flexibilité totale",
      description: "Vos priorités changent ? Le planning s'adapte immédiatement",
    },
    {
      emoji: "📊",
      title: "Statistiques avancées",
      description: "Analysez votre productivité et atteignez vos objectifs",
    },
  ]

  const slogans = [
    {
      title: "🧠 Organisation intelligente",
      desc: "Laissez notre intelligence artificielle organiser vos journées selon vos priorités.",
    },
    {
      title: "🔔 Rappels personnalisés",
      desc: "Recevez des notifications au bon moment pour ne jamais oublier une tâche importante.",
    },
    {
      title: "📅 Planning automatique",
      desc: "Un emploi du temps optimisé rien que pour vous, ajusté en temps réel à vos changements.",
    },
    {
      title: "⚡ Gagnez du temps",
      desc: "Passez moins de temps à planifier, plus de temps à agir.",
    },
    {
      title: "🔒 Sécurité maximale",
      desc: "Vos données personnelles et professionnelles sont protégées par des technologies de pointe.",
    },
    {
      title: "📈 Suivez vos progrès",
      desc: "Visualisez vos réussites et restez motivé jour après jour grâce à notre tableau de bord clair et motivant.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation Header */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center relative z-50">
        <div className="flex items-center space-x-2">
          <Rocket className="h-8 w-8 text-purple-600" />
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            TaskPilot
          </span>
        </div>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <Button
              asChild
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Link to="/dashboard">
                <BarChart className="h-4 w-4 mr-2" />
                Tableau de bord
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hover:bg-white/20 backdrop-blur-sm">
                <Link to="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Se connecter
                </Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Link to="/register">
                  <UserPlus className="h-4 w-4 mr-2" />
                  S'inscrire
                </Link>
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="container relative mx-auto px-4 py-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl" />
        <div className="relative z-10 animate-fade-in space-y-8 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-purple-600 via-primary to-pink-600 bg-clip-text text-transparent leading-tight">
            Maîtrisez votre temps. Simplifiez votre vie.
          </h1>
          <h2 className="text-2xl md:text-3xl text-gray-700 dark:text-gray-300 font-medium max-w-3xl mx-auto">
            Gérez vos tâches de manière intelligente, recevez des rappels automatiques et atteignez vos objectifs sans
            stress.
          </h2>
          <div className="flex justify-center gap-6 flex-wrap mt-12">
            {isAuthenticated ? (
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/30 text-lg"
              >
                <Link to="/dashboard">
                  <BarChart className="h-5 w-5 mr-2" />
                  Accéder à mon tableau de bord
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/30 text-lg"
                >
                  <Link to="/register">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Essayez gratuitement – Commencez en moins de 2 minutes !
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="backdrop-blur-sm border-2 text-lg bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80"
                >
                  <Link to="/login">
                    <LogIn className="h-5 w-5 mr-2" />
                    Se connecter
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Slogans Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Nos fonctionnalités principales
        </h2>
        <div className="max-w-6xl mx-auto px-4 mb-20 grid grid-cols-1 md:grid-cols-3 gap-10">
          {slogans.map((slog, idx) => (
            <div
              key={idx}
              className="bg-white/60 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-6 shadow-md border border-purple-100 dark:border-purple-900/30 transition-transform hover:scale-[1.03] hover:shadow-lg hover:shadow-pink-400/40 cursor-default"
            >
              <h3 className="text-xl font-semibold mb-2 text-purple-700 dark:text-pink-400">{slog.title}</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{slog.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-5xl mx-auto px-4 py-20 bg-gradient-to-r from-purple-50/60 to-pink-50/60 dark:from-gray-900/60 dark:to-gray-800/60 rounded-3xl shadow-lg backdrop-blur-md border border-purple-100 dark:border-purple-900/30">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Pourquoi choisir notre solution ?
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10">
          {benefits.map(({ emoji, title, description }, idx) => (
            <div
              key={idx}
              className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-6 shadow-md backdrop-blur-md border border-purple-100 dark:border-purple-900/50 cursor-default transition hover:shadow-pink-400/30 hover:-translate-y-1 hover:scale-[1.02]"
            >
              <h3 className="text-xl font-semibold mb-1 flex items-center gap-2">
                <span>{emoji}</span>
                {title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="max-w-3xl mx-auto px-4 mt-20 mb-32 text-center">
        <blockquote className="bg-white/90 dark:bg-gray-800/90 rounded-3xl p-12 shadow-xl backdrop-blur-sm italic text-xl text-gray-700 dark:text-gray-300 border border-purple-100 dark:border-purple-900/30">
          &quot;Grâce à cette application, j&apos;ai gagné 5 heures par semaine sur mon organisation !&quot;
        </blockquote>
        <cite className="block mt-6 text-sm text-gray-500 dark:text-gray-400">Marie D. - Chef de projet</cite>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">Planifiez moins. Réalisez plus.</h2>
          <p className="text-xl mb-10">
            Rejoignez des milliers d&apos;utilisateurs qui ont déjà optimisé leur productivité.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {isAuthenticated ? (
              <Button
                asChild
                size="lg"
                className="bg-white text-pink-600 px-10 py-4 rounded-full font-bold hover:bg-gray-100 transition"
              >
                <Link to="/dashboard">
                  <BarChart className="h-5 w-5 mr-2" />
                  Accéder à mon espace
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-pink-600 px-10 py-4 rounded-full font-bold hover:bg-gray-100 transition"
                >
                  <Link to="/register">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Boostez votre productivité, gratuitement
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/20 rounded-full px-10 py-4 font-semibold transition"
                >
                  <Link to="/login">
                    <LogIn className="h-5 w-5 mr-2" />
                    Se connecter
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-100/60 dark:bg-gray-900/60 backdrop-blur-md text-center text-gray-600 dark:text-gray-400 border-t border-purple-100 dark:border-purple-900/30">
        <p>© 2024 TaskPilot. Tous droits réservés.</p>
      </footer>
    </div>
  )
}

export default Landing

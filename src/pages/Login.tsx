"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { LogIn, CheckSquare, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTaskContext } from "@/context/TaskContext"
import { authService } from "@/services/auth"
import logger from "@/utils/logger"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const { refreshTasks } = useTaskContext()

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    if (localStorage.getItem("access_token")) {
      navigate("/dashboard")
    }
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      logger.info("Tentative de connexion...")

      // Utiliser le service d'authentification
      await authService.login(email, password)

      toast({
        title: "Connecté avec succès",
        description: "Bienvenue sur TaskPilot",
      })

      // Rafraîchir les tâches avant de rediriger
      logger.info("Rafraîchissement des tâches après connexion...")
      await refreshTasks()

      // Rediriger vers le dashboard après connexion
      logger.info("Redirection vers le dashboard...")
      navigate("/dashboard")
    } catch (error: any) {
      logger.error("Erreur de connexion:", error)
      toast({
        title: "Erreur",
        description: error.response?.data?.detail || "Identifiants incorrects",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Bouton retour vers la landing page */}
      <div className="absolute top-6 left-6">
        <Button asChild variant="ghost" className="flex items-center gap-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>
        </Button>
      </div>

      <Card className="w-full max-w-md animate-fade-in bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-purple-100 dark:border-purple-900/30">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <CheckSquare className="h-12 w-12 text-purple-600" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            TaskPilot
          </CardTitle>
          <CardDescription>Connectez-vous à votre compte pour gérer vos tâches</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Button variant="link" className="p-0 h-auto font-normal" type="button">
                  Mot de passe oublié?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                  Connexion...
                </div>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Se connecter
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-sm text-center text-muted-foreground">
            Vous n'avez pas de compte?{" "}
            <Link to="/register" className="text-purple-600 hover:text-pink-600 hover:underline font-medium">
              Créer un compte
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Login

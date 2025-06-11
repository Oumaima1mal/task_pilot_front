"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { UserPlus, CheckSquare, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const Register = () => {
  const [nom, setNom] = useState("")
  const [prenom, setPrenom] = useState("")
  const [tel, setTel] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    if (localStorage.getItem("access_token")) {
      navigate("/dashboard")
    }
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("https://task-pilot-back-production.up.railway.app/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom,
          prenom,
          email,
          tel,
          mot_de_passe: password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Erreur lors de l'inscription")
      }

      const data = await response.json()
      toast({
        title: "Inscription réussie",
        description: data.message || "Bienvenue sur TaskPilot ! Vous pouvez maintenant vous connecter.",
        className: "bg-green-50 border-green-200 text-green-800",
      })

      navigate("/login")
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
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
        <Button asChild variant="ghost" className="flex items-center gap-2 hover:bg-white/20 backdrop-blur-sm">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>
        </Button>
      </div>

      <Card className="w-full max-w-2xl animate-fade-in bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-purple-100 dark:border-purple-900/30 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <CheckSquare className="h-12 w-12 text-purple-600" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            TaskPilot
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Créez un compte pour gérer vos tâches efficacement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom" className="text-gray-700 dark:text-gray-300">
                  Nom
                </Label>
                <Input
                  id="nom"
                  placeholder="Votre nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prenom" className="text-gray-700 dark:text-gray-300">
                  Prénom
                </Label>
                <Input
                  id="prenom"
                  placeholder="Votre prénom"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  required
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tel" className="text-gray-700 dark:text-gray-300">
                  Téléphone
                </Label>
                <Input
                  id="tel"
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  value={tel}
                  onChange={(e) => setTel(e.target.value)}
                  required
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                  Mot de passe
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">
                  Confirmer le mot de passe
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2.5 transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                    Inscription en cours...
                  </div>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Créer mon compte
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-600 dark:text-gray-300">
            Vous avez déjà un compte ?{" "}
            <Link
              to="/login"
              className="text-purple-600 hover:text-pink-600 hover:underline font-medium transition-colors"
            >
              Se connecter
            </Link>
          </div>
          <div className="text-xs text-center text-gray-500 dark:text-gray-400 max-w-md">
            En créant un compte, vous acceptez nos{" "}
            <span className="text-purple-600 hover:text-pink-600 cursor-pointer">conditions d'utilisation</span> et
            notre{" "}
            <span className="text-purple-600 hover:text-pink-600 cursor-pointer">politique de confidentialité</span>.
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Register

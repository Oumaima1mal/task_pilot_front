import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Edit, User, Mail, Phone, MapPin, Calendar, Award, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useTaskContext } from "@/context/TaskContext";
import { useGroupContext } from "@/context/GroupContext";

const Profile = () => {
  const { tasks } = useTaskContext();
  const { groups } = useGroupContext();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const completedTasks = tasks.filter(task => task.completed).length;
  const activeTasks = tasks.filter(task => !task.completed).length;
  
  // Utilisateur fictif pour démonstration
  const [user, setUser] = useState({
    name: "Marie Dubois",
    email: "marie.dubois@exemple.fr",
    phone: "+33 6 12 34 56 78",
    location: "Paris, France",
    memberSince: new Date("2023-06-15"),
    bio: "Ingénieure en informatique passionnée par l'organisation et la planification. J'utilise cette application pour gérer mes projets personnels et professionnels."
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    
    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été enregistrées avec succès",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Profil
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-purple-100 dark:border-purple-900/30">
              <CardContent className="pt-6 flex flex-col items-center">
                <Avatar className="w-24 h-24 border-4 border-purple-100 dark:border-purple-900">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xl">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <h2 className="text-xl font-bold mt-4 text-center">{user.name}</h2>
                <p className="text-muted-foreground text-sm text-center">{user.email}</p>
                <p className="text-muted-foreground text-sm text-center mt-1">
                  <MapPin className="h-3 w-3 inline mr-1" />
                  {user.location}
                </p>
                
                <div className="w-full mt-6 grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{completedTasks}</div>
                    <div className="text-xs text-muted-foreground">Tâches terminées</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{groups.length}</div>
                    <div className="text-xs text-muted-foreground">Groupes</div>
                  </div>
                </div>
                
                <div className="w-full pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{user.phone}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Membre depuis {user.memberSince.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-purple-100 dark:border-purple-900/30 mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Statistiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tâches actives</span>
                    <span className="font-medium">{activeTasks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tâches terminées</span>
                    <span className="font-medium">{completedTasks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total des tâches</span>
                    <span className="font-medium">{tasks.length}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Groupes</span>
                    <span className="font-medium">{groups.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-purple-100 dark:border-purple-900/30">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Informations personnelles</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? "Annuler" : "Modifier"}
                  </Button>
                </div>
                <CardDescription>
                  Gérez vos informations personnelles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="profile">Profil</TabsTrigger>
                    <TabsTrigger value="account">Compte</TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile">
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nom complet</Label>
                            <Input 
                              id="name" 
                              name="name" 
                              value={user.name} 
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                              id="email" 
                              name="email" 
                              type="email" 
                              value={user.email} 
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone">Téléphone</Label>
                            <Input 
                              id="phone" 
                              name="phone" 
                              value={user.phone} 
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="location">Localisation</Label>
                            <Input 
                              id="location" 
                              name="location" 
                              value={user.location} 
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <textarea 
                            id="bio" 
                            name="bio" 
                            value={user.bio} 
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-background"
                          />
                        </div>
                        
                        {isEditing && (
                          <div className="flex justify-end">
                            <Button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600">
                              Enregistrer
                            </Button>
                          </div>
                        )}
                      </div>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="account">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Mot de passe</h3>
                        <p className="text-sm text-muted-foreground">
                          Modifiez votre mot de passe pour sécuriser votre compte
                        </p>
                        <Button className="mt-2">Changer le mot de passe</Button>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Suppression du compte</h3>
                        <p className="text-sm text-muted-foreground">
                          La suppression de votre compte est définitive et supprimera toutes vos données
                        </p>
                        <Button variant="destructive" className="mt-2">Supprimer le compte</Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-purple-100 dark:border-purple-900/30 mt-6">
              <CardHeader>
                <CardTitle>Vos groupes</CardTitle>
              </CardHeader>
              <CardContent>
                {groups.length === 0 ? (
                  <div className="text-center py-6">
                    <Users className="h-12 w-12 text-purple-300 dark:text-purple-700 mx-auto mb-3" />
                    <p className="text-muted-foreground">Vous n'avez pas encore rejoint de groupes</p>
                    <Button className="mt-4">
                      Rejoindre un groupe
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {groups.map(group => (
                      <div key={group.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center">
                          <div className="bg-purple-100 dark:bg-purple-900/30 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                            <Users className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{group.name}</h4>
                            <p className="text-xs text-muted-foreground">{group.members.length} membres</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">Voir</Button>
                      </div>
                    ))}
                    <Button asChild variant="outline" className="w-full mt-2">
                      <div>Voir tous les groupes</div>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

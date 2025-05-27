
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Settings = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Paramètres
        </h1>
        
        <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-purple-100 dark:border-purple-900/30">
          <CardHeader>
            <CardTitle>Préférences de notification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications-email">Notifications par email</Label>
              <Switch id="notifications-email" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications-push">Notifications push</Label>
              <Switch id="notifications-push" />
            </div>
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
              Enregistrer les préférences
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;

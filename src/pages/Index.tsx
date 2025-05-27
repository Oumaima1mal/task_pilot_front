
import React from "react";
import Header from "@/components/Header";
import TaskList from "@/components/TaskList";
import { TaskProvider } from "@/context/TaskContext";

const Index = () => {
  return (
    <TaskProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto p-6">
          <TaskList />
        </main>
      </div>
    </TaskProvider>
  );
};

export default Index;

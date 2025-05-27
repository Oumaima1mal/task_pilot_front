
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.log("Ce navigateur ne supporte pas les notifications de bureau");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const sendNotification = (title: string, options?: NotificationOptions): void => {
  if (Notification.permission === "granted") {
    new Notification(title, options);
  }
};

export const scheduleNotification = (task: { title: string; dueDate?: Date; reminder?: Date }): void => {
  if (!task.reminder || !task.dueDate) return;
  
  const now = new Date();
  const reminderTime = new Date(task.reminder);
  
  if (reminderTime > now) {
    const timeoutId = setTimeout(() => {
      sendNotification(`Rappel: ${task.title}`, {
        body: `La tâche "${task.title}" est prévue pour ${
          task.dueDate instanceof Date 
            ? task.dueDate.toLocaleString() 
            : new Date(task.dueDate!).toLocaleString()
        }.`,
        icon: "/favicon.ico"
      });
    }, reminderTime.getTime() - now.getTime());

    // Stockage des timeouts actifs (dans une application réelle, nous utiliserions une solution plus robuste)
    const activeTimeouts = JSON.parse(localStorage.getItem('notificationTimeouts') || '{}');
    activeTimeouts[task.title] = timeoutId;
    localStorage.setItem('notificationTimeouts', JSON.stringify(activeTimeouts));
  }
};

export const cancelNotification = (taskTitle: string): void => {
  const activeTimeouts = JSON.parse(localStorage.getItem('notificationTimeouts') || '{}');
  if (activeTimeouts[taskTitle]) {
    clearTimeout(activeTimeouts[taskTitle]);
    delete activeTimeouts[taskTitle];
    localStorage.setItem('notificationTimeouts', JSON.stringify(activeTimeouts));
  }
};

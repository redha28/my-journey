import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { TimelineFeed } from './components/Timeline/TimelineFeed';
import { CalendarView } from './components/Calendar/CalendarView';
import { WeeklyBarChart } from './components/Analytics/WeeklyBarChart';
import { ProfileView } from './components/Profile/ProfileView';
import { TaskFormModal } from './components/TaskForm/TaskFormModal';
import { ExportModal } from './components/ExportModal/ExportModal';
import { JourneyItem, UserProfile, GitInfo, WebviewMessage } from '../types/journey';
import { getTodayString } from './utils/date';
import { vscode } from './utils/vscode';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('timeline');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [items, setItems] = useState<JourneyItem[]>([]);
  const [profile, setProfile] = useState<UserProfile | undefined>();
  const [gitInfo, setGitInfo] = useState<GitInfo | undefined>();

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<JourneyItem | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Initialize and handle Webview messages from Extension host
  useEffect(() => {
    // Notify extension backend that webview is ready
    vscode.postMessage({ command: 'READY' });

    const handleMessage = (event: MessageEvent<WebviewMessage>) => {
      const message = event.data;
      if (!message || !message.type) return;

      switch (message.type) {
        case 'INIT_DATA':
          setItems(message.payload.items || []);
          if (message.payload.profile) {
            setProfile(message.payload.profile);
          }
          if (message.payload.gitInfo) {
            setGitInfo(message.payload.gitInfo);
          }
          break;

        case 'PROFILE_UPDATED':
          setProfile(message.payload);
          break;

        case 'GIT_INFO':
          setGitInfo(message.payload);
          break;

        case 'ITEM_ADDED':
          setItems(prev => [message.payload, ...prev]);
          break;

        case 'ITEM_UPDATED':
          setItems(prev => prev.map(item => (item.id === message.payload.id ? message.payload : item)));
          break;

        case 'ITEM_DELETED':
          setItems(prev => prev.filter(item => item.id !== message.payload.id));
          break;

        case 'TRIGGER_NEW_ENTRY':
          setEditingItem(null);
          setIsTaskModalOpen(true);
          break;

        case 'TRIGGER_EXPORT_STANDUP':
          setIsExportModalOpen(true);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // CRUD Handlers
  const handleSaveItem = (itemData: Omit<JourneyItem, 'id' | 'createdAt' | 'updatedAt'> | JourneyItem) => {
    if ('id' in itemData) {
      vscode.postMessage({
        command: 'UPDATE_ITEM',
        payload: itemData as JourneyItem
      });
    } else {
      vscode.postMessage({
        command: 'ADD_ITEM',
        payload: itemData
      });
    }
  };

  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    vscode.postMessage({
      command: 'SAVE_PROFILE',
      payload: updatedProfile
    });
  };

  const handleToggleComplete = (item: JourneyItem) => {
    const updated: JourneyItem = {
      ...item,
      completed: !item.completed
    };
    vscode.postMessage({
      command: 'UPDATE_ITEM',
      payload: updated
    });
  };

  const handleDeleteItem = (id: string) => {
    vscode.postMessage({
      command: 'DELETE_ITEM',
      payload: { id }
    });
  };

  const handleOpenNewTask = (forDate?: string) => {
    if (forDate) {
      setSelectedDate(forDate);
    }
    setEditingItem(null);
    setIsTaskModalOpen(true);
  };

  const handleEditItem = (item: JourneyItem) => {
    setEditingItem(item);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#18181b] text-zinc-200 flex flex-col font-sans pb-16">
      {/* Top Sticky Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTask={() => handleOpenNewTask()}
        onOpenExport={() => setIsExportModalOpen(true)}
        totalItemsCount={items.length}
      />

      {/* Main Content Area */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 pt-5 flex-1">
        {activeTab === 'timeline' && (
          <TimelineFeed
            items={items}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onOpenNewTask={() => handleOpenNewTask()}
            onEditItem={handleEditItem}
            onToggleComplete={handleToggleComplete}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            items={items}
            selectedDate={selectedDate}
            onSelectDate={date => {
              setSelectedDate(date);
            }}
            onOpenNewTaskForDate={date => handleOpenNewTask(date)}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {activeTab === 'analytics' && (
          <WeeklyBarChart
            items={items}
            onSelectDate={date => {
              setSelectedDate(date);
              setActiveTab('timeline');
            }}
            onNavigateToTimeline={() => setActiveTab('timeline')}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            profile={profile}
            items={items}
            onSaveProfile={handleSaveProfile}
          />
        )}
      </main>

      {/* Modals */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        editingItem={editingItem}
        defaultDate={selectedDate}
        gitInfo={gitInfo}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        items={items}
        selectedDate={selectedDate}
      />
    </div>
  );
};

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Shield, UserPlus, Search } from 'lucide-react';
import { useUserManagement } from '@/hooks/useUserManagement';
import UsersTableSimplified from '@/components/admin/users/UsersTableSimplified';
import AddAdminDialog from '@/components/admin/users/AddAdminDialog';

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
  const { users, isLoading } = useUserManagement();

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.user_metadata?.name && user.user_metadata.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Fixed background with proper z-index */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.1, 0.5, 0.1],
              scale: [1, 1.3, 1],
              rotate: [0, 360],
            }}
            transition={{
              duration: 10 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 6,
            }}
          >
            <Users className="w-4 h-4 text-blue-400/20" />
          </motion.div>
        ))}
      </div>

      {/* Main content with proper z-index */}
      <motion.div 
        className="relative z-10 space-y-6 p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="h-8 w-8 text-green-600" />
                Users Management
              </h1>
              <p className="text-gray-600 mt-2">Manage your application users and admin privileges</p>
            </div>
            <div className="flex gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 max-w-md"
                />
              </div>
              <Button
                onClick={() => setShowAddAdminDialog(true)}
                className="bg-green-700 hover:bg-green-800"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Admin
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                System Users ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UsersTableSimplified 
                users={filteredUsers} 
                formatDate={formatDate}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <AddAdminDialog 
        open={showAddAdminDialog} 
        setOpen={setShowAddAdminDialog} 
      />
    </div>
  );
};

export default UsersPage;

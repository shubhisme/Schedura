import React, { useState } from 'react';
import { Modal, Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

const privileges = [
  { id: 1, name: 'Create Users', value: 1 },
  { id: 2, name: 'Edit Users', value: 2 },
  { id: 4, name: 'Delete Users', value: 4 },
  { id: 8, name: 'View Reports', value: 8 },
  { id: 16, name: 'Manage Settings', value: 16 },
  { id: 32, name: 'Admin Access', value: 32 },
];

const RolesModal = ({
  visible,
  setVisible,
  orgid,
}: {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  orgid: string;
}) => {
  const [roleName, setRoleName] = useState('');
  const [selectedPrivileges, setSelectedPrivileges] = useState<number[]>([]);

  const togglePrivilege = (value: number) => {
    setSelectedPrivileges((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]
    );
  };

  const calculatePrivilegeValue = () => {
    return selectedPrivileges.reduce((sum, val) => sum + val, 0);
  };

  const handleSubmit = async () => {
    const privilegeValue = calculatePrivilegeValue();
    
    // Call your Supabase controller here
    try {
      // Example: await addRole(orgid, roleName, privilegeValue);
      console.log('Submitting role:', { orgid, name: roleName, privileges: privilegeValue });
      
      // Reset form
      setRoleName('');
      setSelectedPrivileges([]);
      setVisible(false);
    } catch (error) {
      console.error('Error adding role:', error);
    }
  };

  const handleCancel = () => {
    setRoleName('');
    setSelectedPrivileges([]);
    setVisible(false);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 justify-center items-center">
        <Modal animationType="fade" transparent={true} visible={visible}>
          <View className="flex-1 justify-center items-center bg-black/40">
            <View className="rounded-2xl bg-white w-3/4 overflow-hidden max-h-[80%]">
              <View className="pt-5 px-5">
                <Text className="text-xl text-center font-semibold mb-4">Add Role</Text>
              </View>

              <ScrollView className="px-5">
                {/* Role Name Input */}
                <View className="mb-4">
                  <Text className="text-sm font-medium mb-2">Role Name</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Enter role name"
                    value={roleName}
                    onChangeText={setRoleName}
                  />
                </View>

                {/* Privileges Checkboxes */}
                <View className="mb-4">
                  <Text className="text-sm font-medium mb-2">Privileges</Text>
                  {privileges.map((privilege) => (
                    <TouchableOpacity
                      key={privilege.id}
                      className="flex-row items-center mb-3"
                      onPress={() => togglePrivilege(privilege.value)}
                    >
                      <View
                        className={`w-5 h-5 border-2 rounded mr-3 items-center justify-center ${
                          selectedPrivileges.includes(privilege.value)
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedPrivileges.includes(privilege.value) && (
                          <Text className="text-white text-xs">✓</Text>
                        )}
                      </View>
                      <Text className="text-sm">{privilege.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Buttons */}
              <View className="flex-row border-t border-gray-200">
                <TouchableOpacity
                  className="flex-1 py-4 items-center border-r border-gray-200"
                  onPress={handleCancel}
                >
                  <Text className="text-gray-600 font-medium">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-4 items-center"
                  onPress={handleSubmit}
                  disabled={!roleName.trim()}
                >
                  <Text
                    className={`font-medium ${
                      roleName.trim() ? 'text-blue-500' : 'text-gray-300'
                    }`}
                  >
                    Submit
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default RolesModal;
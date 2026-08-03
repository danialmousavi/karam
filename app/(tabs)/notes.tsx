import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { db, NoteFolder } from "../../services/database";
import { useTheme } from "../../context/ThemeContext";
import AddFolderModal from "../../components/notes/AddFolderModal";
import CustomAlert from "../../components/CustomAlert";
import { PASTEL_PALETTE } from "../../components/categories/ColorPalette";

export default function NotesFoldersScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [isFolderModalVisible, setFolderModalVisible] = useState(false);

  const [newFolderName, setNewFolderName] = useState("");
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    folderIdToDelete: "",
    folderNameToDelete: "",
  });

  const loadFolders = async () => {
    const data = await db.getNoteFolders();
    setFolders(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadFolders();
    }, []),
  );

  const handleSaveFolder = async () => {
    if (!newFolderName.trim()) return;

    const selectedColorHex = PASTEL_PALETTE[selectedColorIndex].color;
    await db.addNoteFolder(newFolderName.trim(), selectedColorHex);

    setNewFolderName("");
    setSelectedColorIndex(0);
    setFolderModalVisible(false);
    loadFolders();
  };

  const confirmDeleteFolder = async () => {
    await db.deleteNoteFolder(alertConfig.folderIdToDelete);
    setAlertConfig((prev) => ({ ...prev, visible: false }));
    loadFolders();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerContainer}>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerTitle, { color: colors.primaryDark }]}>
            پوشه‌های من 📁
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            یادداشت‌هات رو اینجا دسته‌بندی و مدیریت کن
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.addFolderBtn,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => setFolderModalVisible(true)}
        >
          <Feather name="folder-plus" size={22} color={colors.primaryDark} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={folders}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.folderCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() =>
              router.push({
                pathname: "/notes/[id]",
                params: { id: item.id, name: item.name },
              })
            }
          >
            <TouchableOpacity
              style={styles.deleteIcon}
              onPress={() =>
                setAlertConfig({
                  visible: true,
                  folderIdToDelete: item.id,
                  folderNameToDelete: item.name,
                })
              }
            >
              <Feather
                name="trash-2"
                size={18}
                color={colors.danger || "#d32f2f"}
              />
            </TouchableOpacity>

            <Feather
              name="folder"
              size={40}
              color={item.color || colors.primary}
              style={{ marginBottom: 10 }}
            />
            <Text
              style={[styles.folderName, { color: colors.text }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      <AddFolderModal
        visible={isFolderModalVisible}
        onClose={() => setFolderModalVisible(false)}
        onSave={handleSaveFolder}
        folderName={newFolderName}
        setFolderName={setNewFolderName}
        selectedColorIndex={selectedColorIndex}
        setSelectedColorIndex={setSelectedColorIndex}
      />

      <CustomAlert
        visible={alertConfig.visible}
        type="danger"
        title="حذف پوشه"
        message={`آیا از حذف پوشه "${alertConfig.folderNameToDelete}" و تمام یادداشت‌های آن مطمئن هستید؟`}
        showCancel
        onConfirm={confirmDeleteFolder}
        onCancel={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  headerContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTextContainer: {
    flex: 1,
    paddingLeft: 15,
  },
  headerTitle: {
    fontFamily: "Vazir-Bold",
    fontSize: 24,
    textAlign: "right",
    marginBottom: 4,
  },
  headerSubtitle: {
    textAlign: "right",
    fontFamily: "Vazir-Bold",
    fontSize: 13,
  },
  addFolderBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  listContainer: { paddingHorizontal: 10, paddingBottom: 120 },
  folderCard: {
    flex: 1,
    margin: 10,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  deleteIcon: { position: "absolute", top: 12, left: 12, padding: 4 },
  folderName: { fontFamily: "Vazir-Bold", fontSize: 16, textAlign: "center" },
});

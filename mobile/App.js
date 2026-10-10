import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

const API = process.env.EXPO_PUBLIC_API_BASE_URL || "http://10.0.2.2:3000";
const options = ["Realistic", "Anime", "Logo", "Poster", "3D", "Watercolor"];
const sizes = [{ label: "Square", value: "1024x1024" }, { label: "Portrait", value: "1024x1536" }, { label: "Landscape", value: "1536x1024" }];

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Realistic");
  const [size, setSize] = useState("1024x1024");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  async function generate() {
    setError(""); setImage("");
    if (prompt.trim().length < 3) { setError("Enter an image prompt of at least 3 characters."); return; }
    setBusy(true);
    try {
      const r = await fetch(API + "/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), style, size })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Generation failed");
      setImage(d.image);
    } catch (e) {
      setError((e instanceof Error ? e.message : "Cannot reach API") + ". Check the API URL and internet connection.");
    } finally { setBusy(false); }
  }

  async function saveImage() {
    if (!image) return;
    setSaving(true);
    let localUri = image;
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) throw new Error("Allow photo-library permission to save images.");
      if (image.startsWith("data:image/")) {
        const base64 = image.substring(image.indexOf(",") + 1);
        localUri = (FileSystem.cacheDirectory || "") + "nagigen-" + Date.now() + ".png";
        await FileSystem.writeAsStringAsync(localUri, base64, { encoding: FileSystem.EncodingType.Base64 });
      } else if (image.startsWith("http")) {
        const target = (FileSystem.cacheDirectory || "") + "nagigen-" + Date.now() + ".png";
        const result = await FileSystem.downloadAsync(image, target);
        localUri = result.uri;
      } else throw new Error("This image format cannot be saved on this device.");
      await MediaLibrary.saveToLibraryAsync(localUri);
      Alert.alert("Saved", "Image saved to your photo library.");
    } catch (e) {
      Alert.alert("Could not save image", e instanceof Error ? e.message : "Please try again.");
    } finally { setSaving(false); }
  }

  return <SafeAreaView style={s.safe}><StatusBar barStyle="light-content" /><ScrollView contentContainerStyle={s.container}>
    <Text style={s.brand}>✦ NagiGen <Text style={s.accent}>AI</Text></Text>
    <Text style={s.kicker}>AI IMAGE STUDIO</Text>
    <Text style={s.title}>Imagine it.{"\n"}<Text style={s.accent}>Bring it to life.</Text></Text>
    <Text style={s.sub}>Create AI artwork from your prompt. Pick a style and generate.</Text>
    <View style={s.panel}>
      <Text style={s.label}>Describe your image</Text>
      <TextInput value={prompt} onChangeText={setPrompt} multiline maxLength={2000} placeholder="An anime city at sunset..." placeholderTextColor="#777990" style={s.input} />
      <Text style={s.label}>Choose a style</Text>
      <View style={s.chips}>{options.map(x => <TouchableOpacity key={x} onPress={() => setStyle(x)} style={[s.chip, style === x && s.active]}><Text style={{ color: style === x ? "#171020" : "#c8c5da" }}>{x}</Text></TouchableOpacity>)}</View>
      <Text style={s.label}>Image size</Text>
      <View style={s.chips}>{sizes.map(x => <TouchableOpacity key={x.value} onPress={() => setSize(x.value)} style={[s.chip, size === x.value && s.active]}><Text style={{ color: size === x.value ? "#171020" : "#c8c5da" }}>{x.label}</Text></TouchableOpacity>)}</View>
      <TouchableOpacity disabled={busy} onPress={generate} style={[s.button, busy && s.disabled]}>{busy ? <ActivityIndicator color="#171020" /> : <Text style={s.buttonText}>✦ Generate image</Text>}</TouchableOpacity>
      {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      {!!image && <View style={s.result}><Image source={{ uri: image }} style={s.image} resizeMode="contain" /><TouchableOpacity disabled={saving} onPress={saveImage} style={s.saveButton}>{saving ? <ActivityIndicator color="#e9ddff" /> : <Text style={s.saveText}>Save to photos</Text>}</TouchableOpacity></View>}
    </View>
    <Text style={s.footer}>NagiGen AI · Keep creating</Text>
  </ScrollView></SafeAreaView>;
}

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:"#090a12"},container:{padding:22,paddingBottom:40},brand:{fontSize:23,fontWeight:"800",color:"#fff",marginTop:14},accent:{color:"#c0a3ff"},kicker:{color:"#c0a3ff",letterSpacing:3,fontSize:10,marginTop:38},title:{fontSize:40,lineHeight:48,fontWeight:"800",color:"#fff",marginTop:12},sub:{fontSize:14,lineHeight:22,color:"#9b9eb5",marginTop:14,marginBottom:24},panel:{backgroundColor:"#12131f",borderWidth:1,borderColor:"#2a2b40",borderRadius:18,padding:16},label:{color:"#e4e1f5",fontSize:13,fontWeight:"700",marginBottom:10,marginTop:8},input:{minHeight:130,textAlignVertical:"top",borderWidth:1,borderColor:"#303147",backgroundColor:"#090b14",borderRadius:12,padding:13,color:"#fff",fontSize:14},chips:{flexDirection:"row",flexWrap:"wrap",gap:8,marginBottom:18},chip:{borderWidth:1,borderColor:"#39354e",paddingVertical:9,paddingHorizontal:12,borderRadius:20},active:{backgroundColor:"#c0a3ff",borderColor:"#c0a3ff"},button:{minHeight:50,alignItems:"center",justifyContent:"center",backgroundColor:"#c0a3ff",borderRadius:12},disabled:{opacity:0.65},buttonText:{color:"#171020",fontWeight:"800"},error:{color:"#ffc5dc",fontSize:12,lineHeight:18,marginTop:12},result:{marginTop:20,alignItems:"center"},image:{width:"100%",height:320,backgroundColor:"#090b14",borderRadius:12},saveButton:{marginTop:12,borderWidth:1,borderColor:"#67518b",borderRadius:10,paddingVertical:12,paddingHorizontal:20},saveText:{color:"#e9ddff",fontWeight:"700"},footer:{textAlign:"center",color:"#777990",fontSize:11,marginTop:28}
});

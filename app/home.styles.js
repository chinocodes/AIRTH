import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    backgroundColor: "#F6F8FA",
    flex: 1,
  },
  lottie: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    pointerEvents: 'none',
  },
  content: {
    paddingBottom: 120,
  },
  backButton: {
    backgroundColor: "#2ECC71",
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 20,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 12
  },
  deleteButton: {
    backgroundColor: "#ec0505",
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 20,
    alignItems: "center",
  },
  backButtonText: {
    color: "#ffffff",
    fontWeight: "bold"

  },
  achievementTexts: {
    color: "#111",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
    textAlign: "center",
    padding: 20,
  },
  acheivementContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 30,
    padding: 12,
    marginVertical: 10
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111",
  },
  subGreeting: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  heroCard: {
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
  },
  logoContainer: { alignItems: 'center', marginBottom: 30, paddingTop: 50 },
  logo: { width: 80, height: 80, marginBottom: 5 },
  city: {
    fontSize: 18,
    color: "#666",
  },
  temperature: {
    fontSize: 56,
    fontWeight: "800",
    color: "#111",
    marginTop: 6,
  },
  aqiBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  aqiLabel: {
    fontSize: 12,
    color: "#666",
  },
  aqiValue: {
    fontSize: 26,
    fontWeight: "800",
  },
  pillRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  pill: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  pillTitle: {
    fontSize: 13,
    color: "#888",
  },
  pillValue: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  section: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 14,
  },
  progressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  reset: {
    // justifyContent: "center",
    // alignItems: "center",
    alignSelf: "flex-end",
    right: 5,
    paddingTop: 13,
    paddingRight: 13,

  },
  resetButton : {
    backgroundColor: "#2ECC71",
    padding: 14,
    borderRadius: 13,
   

  },
  mapWrapper: {
    height: 220,
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  map: {
    flex: 1,
  },
});
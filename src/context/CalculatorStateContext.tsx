import React, { createContext, useState, useCallback, useEffect } from "react";
import type { CalculationFormData } from "../schemas";
import type { CalculationResult, Data } from "../types/types";
import { saveFormData, loadFormData, clearFormData, getSaveEnabled, setSaveEnabled } from "../utilities";

const defaultForm: CalculationFormData = {
  shard: "",
  quantity: 100,
  hunterFortune: 0,
  excludeChameleon: false,
  frogBonus: false,
  newtLevel: 10,
  salamanderLevel: 10,
  lizardKingLevel: 10,
  leviathanLevel: 10,
  pythonLevel: 10,
  kingCobraLevel: 10,
  seaSerpentLevel: 10,
  tiamatLevel: 10,
  crocodileLevel: 10,
  kuudraTier: "none", // No Kuudra by default
  moneyPerHour: Infinity,
  customKuudraTime: false,
  kuudraTimeSeconds: null,
  noWoodenBait: false,
  ironManView: false,
  instantBuyPrices: true,
  craftPenalty: 0.8,
  materialsOnly: false,
  selectedShardKeys: [],
  shardQuantities: [],
};

interface CalculatorStateContextType {
  form: CalculationFormData;
  setForm: (data: CalculationFormData) => void;
  resetForm: () => void;
  result: CalculationResult | null;
  setResult: (result: CalculationResult | null) => void;
  calculationData: Data | null;
  setCalculationData: (data: Data | null) => void;
  targetShardName: string;
  setTargetShardName: (name: string) => void;
  saveEnabled: boolean;
  setSaveEnabledState: (enabled: boolean) => void;
}

const CalculatorStateContext = createContext<CalculatorStateContextType | undefined>(undefined);

export { CalculatorStateContext };

export const CalculatorStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with localStorage data only if save is enabled
  const [form, setForm] = useState<CalculationFormData>(() => {
    const isSaveEnabled = getSaveEnabled();
    if (isSaveEnabled) {
      const savedData = loadFormData();

      if (savedData) {
        return {
          ...defaultForm,
          ...savedData,
        };
      }
    }
    return defaultForm;
  });
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [calculationData, setCalculationData] = useState<Data | null>(null);
  const [targetShardName, setTargetShardName] = useState<string>("");
  const [saveEnabled, setSaveEnabledLocal] = useState<boolean>(() => getSaveEnabled());

  // Auto-save on every change (only if save is enabled)
  useEffect(() => {
    if (saveEnabled) {
      saveFormData(form);
    }
  }, [form, saveEnabled]);

  const handleSetForm = useCallback((data: CalculationFormData) => {
    setForm(data);
  }, []);

  const setSaveEnabledState = useCallback((enabled: boolean) => {
    setSaveEnabledLocal(enabled);
    setSaveEnabled(enabled);

    // If saving is disabled, only clear saved data but keep current form
    if (!enabled) {
      clearFormData();
    }
  }, []);

  const resetForm = useCallback(() => {
    setForm(defaultForm);
    // Only clear saved data if saving is enabled
    if (saveEnabled) {
      clearFormData();
    }
  }, [saveEnabled]);

  return (
    <CalculatorStateContext.Provider
      value={{
        form,
        setForm: handleSetForm,
        resetForm,
        result,
        setResult,
        calculationData,
        setCalculationData,
        targetShardName,
        setTargetShardName,
        saveEnabled,
        setSaveEnabledState,
      }}
    >
      {children}
    </CalculatorStateContext.Provider>
  );
};

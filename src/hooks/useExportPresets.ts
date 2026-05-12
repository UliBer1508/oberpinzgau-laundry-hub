import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { ExportType, ExportPreset } from "@/lib/runExport";

export interface StoredExportPreset extends ExportPreset {
  id: string;
  preset_type: ExportType;
}

export function useExportPresets() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["export_presets", user?.id ?? null],
    enabled: !!user,
    queryFn: async (): Promise<Record<ExportType, StoredExportPreset | undefined>> => {
      const { data, error } = await supabase
        .from("user_export_presets")
        .select("id, preset_type, statuses, date_mode, von, bis, action");
      if (error) throw error;
      const map: Partial<Record<ExportType, StoredExportPreset>> = {};
      (data ?? []).forEach((row) => {
        map[row.preset_type as ExportType] = row as StoredExportPreset;
      });
      return map as Record<ExportType, StoredExportPreset | undefined>;
    },
  });

  const save = useMutation({
    mutationFn: async ({ type, preset }: { type: ExportType; preset: ExportPreset }) => {
      if (!user) throw new Error("Nicht angemeldet");
      const { error } = await supabase
        .from("user_export_presets")
        .upsert(
          {
            user_id: user.id,
            preset_type: type,
            statuses: preset.statuses,
            date_mode: preset.date_mode,
            von: preset.von,
            bis: preset.bis,
            action: preset.action,
          },
          { onConflict: "user_id,preset_type" },
        );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["export_presets"] }),
  });

  const remove = useMutation({
    mutationFn: async (type: ExportType) => {
      if (!user) throw new Error("Nicht angemeldet");
      const { error } = await supabase
        .from("user_export_presets")
        .delete()
        .eq("user_id", user.id)
        .eq("preset_type", type);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["export_presets"] }),
  });

  return {
    presets: query.data ?? ({} as Record<ExportType, StoredExportPreset | undefined>),
    isLoading: query.isLoading,
    savePreset: save.mutateAsync,
    deletePreset: remove.mutateAsync,
  };
}

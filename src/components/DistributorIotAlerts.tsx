import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Thermometer, Droplets, Database, AlertTriangle, CheckCircle2, RefreshCw, MessageCircle, CloudRain } from "lucide-react";
import { useAccount } from "wagmi";

type TempStatus = "OK" | "LOW" | "HIGH" | "UNKNOWN";
type PhStatus = "OK" | "LOW" | "HIGH" | "N/A" | "UNKNOWN";
type HumidityStatus = "OK" | "LOW" | "HIGH" | "N/A" | "UNKNOWN";

interface IotAlert {
  id: string;
  batchId: string;
  cropName: string;
  storageId: string;
  temp: number;
  humidity: number;
  ph: number;
  tempStatus: TempStatus;
  phStatus: PhStatus;
  humidityStatus: HumidityStatus;
  timestamp: string;
  ipfsHash: string | null;
  notifiedDistributor: boolean;
}

interface Props {
  batchId: string | number;
  cropName: string;
  /** WhatsApp number like 91XXXXXXXXXX; defaults to demo number */
  distributorContact?: string;
  /** Current owner address of the batch */
  currentOwner: string;
  /** Distributor address for this batch */
  distributorAddress: string;
}

export function DistributorIotAlerts({
  batchId,
  cropName,
  distributorContact = "918220318626", // Replace with real number or from batch data
  currentOwner,
  distributorAddress,
}: Props) {
  const [alerts, setAlerts] = useState<IotAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
    const [isDistributor, setIsDistributor] = useState(false); // ADD THIS LINE

  const { toast } = useToast();
  const { address } = useAccount();

  // Check if batch is still with distributor (not moved to retailer/consumer)
  const isBatchWithDistributor = currentOwner && distributorAddress &&
    currentOwner.toLowerCase() === distributorAddress.toLowerCase();
  
  // Show simulate button if batch is with ANY distributor (for demo/testing)
  const canSimulate = isBatchWithDistributor;

  // ADD THIS ENTIRE BLOCK HERE ↓
  useEffect(() => {
    const checkRole = async () => {
      if (!address) {
        setIsDistributor(false);
        return;
      }
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
        const res = await fetch(`${apiBase}/api/user/role/${address}`);
        const data = await res.json();
        setIsDistributor(data.role === "distributor");
      } catch (err) {
        console.error("Failed to check role:", err);
        setIsDistributor(false);
      }
    };
    checkRole();
  }, [address]);

  

  // Fetch alerts for this batch
  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
      const res = await fetch(
        `${apiBase}/api/distributor/iot/alerts?batchId=${encodeURIComponent(
          String(batchId)
        )}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load IoT alerts");
      }

      setAlerts(data.alerts || []);
    } catch (err: any) {
      console.error("[IoT] loadAlerts error:", err);
      setError(err.message || "Failed to load IoT alerts");
    } finally {
      setLoading(false);
    }
  };

  // Simulate IoT reading and refresh alerts
  const handleSimulate = async () => {
    try {
      setSimulating(true);
      setError(null);

      const storageId = `DISTR-${Math.floor(Math.random() * 5) + 1}`;
      const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

      const res = await fetch(`${apiBase}/api/distributor/iot/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId: String(batchId),
          cropName,
          storageId,
          distributorContact, // WhatsApp if breach detected
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Simulation failed");
      }

      toast({
        title: "IoT simulation complete",
        description: `Temp: ${data.alert.temp.toFixed(2)}°C, pH: ${data.alert.ph.toFixed(2)}`,
      });

      // Reload alerts
      await loadAlerts();
    } catch (err: any) {
      console.error("[IoT] simulate error:", err);
      setError(err.message || "Simulation failed");
      toast({
        title: "Simulation error",
        description: err.message || "Could not simulate IoT reading",
        variant: "destructive",
      });
    } finally {
      setSimulating(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId]);

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const statusBadgeClass = (status: TempStatus | PhStatus | HumidityStatus) => {
    switch (status) {
      case "OK":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "HIGH":
        return "bg-red-100 text-red-700 border-red-200";
      case "LOW":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const hasBreach = (a: IotAlert) =>
    (a.tempStatus !== "OK" && a.tempStatus !== "UNKNOWN") ||
    (a.phStatus !== "OK" && a.phStatus !== "N/A" && a.phStatus !== "UNKNOWN") ||
    (a.humidityStatus !== "OK" && a.humidityStatus !== "N/A" && a.humidityStatus !== "UNKNOWN");

  return (
    <Card className="mt-6 border-l-4 border-l-blue-500">
      <CardHeader className="flex flex-row items-center justify-between gap-4 bg-slate-50">
        <div>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Database className="w-5 h-5 text-blue-600" />
            Cold Storage Alerts
          </CardTitle>
          <p className="text-sm text-slate-600">
            Real-time monitoring: temperature &amp; pH levels for Batch #{batchId} ({cropName})
          </p>
        </div>
        {canSimulate && (
          <Button
            size="sm"
            onClick={handleSimulate}
            disabled={simulating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {simulating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Simulating...
              </>
            ) : (
              <>
                <Thermometer className="mr-2 h-4 w-4" />
                Simulate Reading
              </>
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {/* Loading */}
        {loading && (
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="p-4 text-sm text-red-600 flex items-center gap-2 bg-red-50 border-t">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && alerts.length === 0 && (
          <div className="p-6 text-center text-sm text-slate-600">
            {!isBatchWithDistributor ? (
              <>
                <p className="font-medium text-slate-700">No products in cold storage</p>
                <p className="text-xs text-slate-400 mt-1">
                  This batch has moved beyond the distributor stage.
                </p>
              </>
            ) : (
              <>
                <p>No IoT readings recorded yet for this batch.</p>
                {canSimulate && (
                  <p className="text-xs text-slate-400 mt-1">
                    Click "Simulate Reading" to generate sample storage conditions.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Alerts Table */}
        {!loading && !error && alerts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Time</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Storage Unit</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Temperature</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Humidity</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">pH Level</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {alerts.map((a) => {
                  const breach = hasBreach(a);
                  const humidityValue = Number(a.humidity ?? 0);
                  const humidityStatus = a.humidityStatus || "N/A";
                  const phValue = Number(a.ph ?? 0);
                  return (
                    <tr
                      key={a.id}
                      className={breach ? "bg-red-50/50 hover:bg-red-50" : "hover:bg-slate-50"}
                    >
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {formatTime(a.timestamp)}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {a.storageId}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-slate-500" />
                          <span className="font-semibold text-slate-900">
                            {a.temp.toFixed(1)}°C
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium ${statusBadgeClass(a.tempStatus)}`}
                          >
                            {a.tempStatus}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <CloudRain className="w-4 h-4 text-slate-500" />
                          <span className="font-semibold text-slate-900">
                            {humidityValue.toFixed(1)}%
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium ${statusBadgeClass(humidityStatus)}`}
                          >
                            {humidityStatus}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-slate-500" />
                          <span className="font-semibold text-slate-900">
                            {phValue.toFixed(2)}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium ${statusBadgeClass(a.phStatus)}`}
                          >
                            {a.phStatus}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {breach ? (
                          <Badge className="bg-red-100 text-red-800 border-red-300 font-medium">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Excursion
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-medium">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Normal
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {a.ipfsHash && (
                            <Badge
                              variant="outline"
                              className="text-[11px] font-mono bg-slate-100 text-slate-700 cursor-help"
                              title={a.ipfsHash}
                            >
                               {a.ipfsHash.slice(0, 8)}
                            </Badge>
                          )}
                          {a.notifiedDistributor && (
                            <Badge className="bg-green-100 text-green-800 border-green-300 text-[11px] font-medium">
                              <MessageCircle className="w-3 h-3 mr-1" />
                              Notified
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

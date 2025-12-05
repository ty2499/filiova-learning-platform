import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Check } from "lucide-react";
import { useAdminSettingsSections } from "@/hooks/useAdminSettingsSections";

export function PaymentGatewaysSection() {
  const {
    newGateway,
    setNewGateway,
    loadingGateways,
    gateways,
    saveGatewayMutation,
    setPrimaryMutation,
    toggleGatewayMutation,
    deleteGatewayMutation
  } = useAdminSettingsSections();

  const getGatewayDisplayName = (gatewayId: string): string => {
    const nameMap: Record<string, string> = {
      'stripe': 'Stripe',
      'paypal': 'PayPal',
      'paystack': 'Paystack',
      'square': 'Square',
      'razorpay': 'Razorpay',
      'dodopay': 'DoDo Pay',
      'vodapay': 'VodaPay'
    };
    return nameMap[gatewayId] || gatewayId.charAt(0).toUpperCase() + gatewayId.slice(1);
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Payment Gateway Configuration</h2>
      
      <div className="border rounded-lg p-4 mb-6 bg-gray-50 dark:bg-gray-800">
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Add New Payment Gateway</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="gateway-id">Gateway ID</Label>
            <Select value={newGateway.gatewayId} onValueChange={(value) => setNewGateway({ ...newGateway, gatewayId: value, gatewayName: getGatewayDisplayName(value) })}>
              <SelectTrigger data-testid="select-gateway-id">
                <SelectValue placeholder="Select gateway" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="paystack">Paystack</SelectItem>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="razorpay">Razorpay</SelectItem>
                <SelectItem value="dodopay">DoDo Pay</SelectItem>
                <SelectItem value="vodapay">VodaPay</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="gateway-name">Gateway Name</Label>
            <Input
              id="gateway-name"
              value={newGateway.gatewayName}
              onChange={(e) => setNewGateway({ ...newGateway, gatewayName: e.target.value })}
              data-testid="input-gateway-name"
            />
          </div>
          <div>
            <Label htmlFor="publishable-key">Publishable Key</Label>
            <Input
              id="publishable-key"
              type="password"
              placeholder="pk_..."
              value={newGateway.publishableKey}
              onChange={(e) => setNewGateway({ ...newGateway, publishableKey: e.target.value })}
              data-testid="input-publishable-key"
            />
          </div>
          <div>
            <Label htmlFor="secret-key">Secret Key</Label>
            <Input
              id="secret-key"
              type="password"
              placeholder="sk_..."
              value={newGateway.secretKey}
              onChange={(e) => setNewGateway({ ...newGateway, secretKey: e.target.value })}
              data-testid="input-secret-key"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="webhook-secret">Webhook Secret</Label>
            <Input
              id="webhook-secret"
              type="password"
              placeholder="whsec_..."
              value={newGateway.webhookSecret}
              onChange={(e) => setNewGateway({ ...newGateway, webhookSecret: e.target.value })}
              data-testid="input-webhook-secret"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={newGateway.testMode}
              onCheckedChange={(checked) => setNewGateway({ ...newGateway, testMode: checked })}
              data-testid="switch-test-mode"
            />
            <Label>Test Mode</Label>
          </div>
        </div>
        <Button
          className="mt-4"
          onClick={() => saveGatewayMutation.mutate(newGateway)}
          disabled={!newGateway.gatewayId || !newGateway.secretKey || saveGatewayMutation.isPending}
          data-testid="button-add-gateway"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Payment Gateway
        </Button>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Configured Payment Gateways</h3>
        {loadingGateways ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : gateways.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No payment gateways configured yet</div>
        ) : (
          gateways.map((gateway) => (
            <div
              key={gateway.id}
              className={`border rounded-lg p-4 ${gateway.isPrimary ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'bg-white dark:bg-gray-800'}`}
              data-testid={`gateway-${gateway.gatewayId}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{gateway.gatewayName}</h4>
                    {gateway.isPrimary && (
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Primary
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${gateway.testMode ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                      {gateway.testMode ? 'Test Mode' : 'Live Mode'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-3">
                    <div>Publishable Key: <span className="font-mono">{"•".repeat(15)}</span></div>
                    <div>Secret Key: <span className="font-mono">{"•".repeat(15)}</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={gateway.isEnabled}
                      onCheckedChange={(checked) => 
                        toggleGatewayMutation.mutate({ 
                          gatewayId: gateway.gatewayId, 
                          isEnabled: checked 
                        })
                      }
                      disabled={toggleGatewayMutation.isPending}
                      data-testid={`switch-enable-${gateway.gatewayId}`}
                    />
                    <Label className="text-sm font-medium">
                      {gateway.isEnabled ? 'Enabled' : 'Disabled'}
                    </Label>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!gateway.isPrimary && gateway.isEnabled && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPrimaryMutation.mutate(gateway.gatewayId)}
                      disabled={setPrimaryMutation.isPending}
                      data-testid={`button-set-primary-${gateway.gatewayId}`}
                    >
                      Set Primary
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteGatewayMutation.mutate(gateway.gatewayId)}
                    disabled={deleteGatewayMutation.isPending}
                    data-testid={`button-delete-gateway-${gateway.gatewayId}`}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

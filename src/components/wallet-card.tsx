
"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Copy, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import Image from "next/image";
import type { CryptoMarketData, User, Transaction } from "@/lib/types";
import { submitWithdrawalRequest } from "@/lib/actions";

const withdrawalSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: "Please enter a valid amount." })
    .positive({ message: "Amount must be positive." }),
  asset: z.string().min(1, { message: "Please select an asset." }),
  address: z
    .string()
    .min(26, { message: "Wallet address seems too short." })
    .max(62, { message: "Wallet address seems too long." }),
});

type WithdrawalFormValues = z.infer<typeof withdrawalSchema>;

type DepositWalletInfo = { name: string; address: string; warning: string };
type DepositWallets = { [key: string]: DepositWalletInfo };

const COIN_IDS = "bitcoin,ethereum,tether,ripple,solana,dogecoin";

const initialDepositWallets: DepositWallets = {
  btc: { name: "Bitcoin", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", warning: "Only send BTC to this address." },
  eth: { name: "Ethereum", address: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B", warning: "Only send ETH (ERC-20) to this address." },
  usdt: { name: "Tether", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", warning: "Only send USDT (ERC-20) to this address." },
  xrp: { name: "Ripple", address: "rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh", warning: "Only send XRP to this address. Destination Tag may be required." },
  sol: { name: "Solana", address: "So11111111111111111111111111111111111111112", warning: "Only send SOL to this address." },
  doge: { name: "Dogecoin", address: "D7bA4w4zL1N7k1M3fQ5cZ6eP9aB8iGfT3k", warning: "Only send DOGE to this address." },
};

export function WalletCard() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [cryptoData, setCryptoData] = useState<CryptoMarketData[]>([]);
  const [depositWallets, setDepositWallets] = useState<DepositWallets>(initialDepositWallets);
  const [selectedDepositAsset, setSelectedDepositAsset] = useState<string>("btc");

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch(`/api/market-data`);
        if (!response.ok) throw new Error("Network response was not ok");
        const result: CryptoMarketData[] = await response.json();
        setCryptoData(result);
      } catch (error) {
        console.error("Failed to fetch crypto data:", error);
      }
    };

    const loadWalletAddresses = () => {
        if (typeof window !== 'undefined') {
            const storedWalletsRaw = localStorage.getItem('siteDepositWallets');
            if (storedWalletsRaw) {
                try {
                  const storedWallets = JSON.parse(storedWalletsRaw);
                  const updatedWallets: DepositWallets = { ...initialDepositWallets };
                  for (const key in storedWallets) {
                      if (updatedWallets[key]) {
                          updatedWallets[key].address = storedWallets[key].address;
                          updatedWallets[key].name = storedWallets[key].name;
                      }
                  }
                  setDepositWallets(updatedWallets);
                } catch (e) {
                  console.error("Failed to parse wallet addresses from storage", e)
                }
            }
        }
    };
    
    fetchMarketData();
    loadWalletAddresses();
  }, []);

  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: '',
      asset: "bitcoin",
      address: "",
    },
  });

  const activeWallet = depositWallets[selectedDepositAsset];

  const handleCopy = () => {
    if (activeWallet) {
      navigator.clipboard.writeText(activeWallet.address);
      toast({
        title: "Copied to clipboard!",
        description: "Wallet address has been copied.",
      });
    }
  };

  const onSubmit = (values: WithdrawalFormValues) => {
    startTransition(async () => {
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('loggedInUser') : null;
        if (!storedUser) {
            toast({
              title: "Error",
              description: "You must be logged in to make a withdrawal.",
              variant: "destructive",
            });
            return;
        }
        const user = JSON.parse(storedUser);
        const result = await submitWithdrawalRequest(values, user);

        if (result.success) {
            toast({
              title: "Success",
              description: "Your withdrawal request has been submitted for processing.",
            });
            form.reset();
            window.dispatchEvent(new Event('storage'));
        } else {
            toast({
              title: "Error",
              description: result.error || "An unexpected error occurred.",
              variant: "destructive",
            });
        }
    });
  };
  
  const renderSelectItem = (coin: CryptoMarketData) => {
    return (
        <SelectItem value={coin.id.toLowerCase()} key={coin.id}>
            <div className="flex items-center gap-2">
                <Image src={coin.image} alt={coin.name} width={20} height={20} />
                <span>{coin.name} ({coin.symbol.toUpperCase()})</span>
            </div>
        </SelectItem>
    );
  };
  
   const renderDepositSelectItem = (coinKey: string, coinName: string) => {
    const coinData = cryptoData.find(c => c.symbol.toLowerCase() === coinKey.toLowerCase());
    return (
         <SelectItem value={coinKey} key={coinKey}>
            <div className="flex items-center gap-2">
                {coinData && <Image src={coinData.image} alt={coinData.name} width={20} height={20} />}
                <span>{coinName} ({coinKey.toUpperCase()})</span>
            </div>
        </SelectItem>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet</CardTitle>
        <CardDescription>Deposit or withdraw your assets.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>
          <TabsContent value="deposit" className="mt-4 space-y-4">
             <div className="space-y-2">
                <Label htmlFor="deposit-asset">Select Asset to Deposit</Label>
                 <Select
                    onValueChange={(value) => setSelectedDepositAsset(value)}
                    defaultValue={selectedDepositAsset}
                  >
                    <SelectTrigger id="deposit-asset">
                        <SelectValue placeholder="Select an asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(depositWallets).map(([key, wallet]) => renderDepositSelectItem(key, wallet.name))}
                    </SelectContent>
                </Select>
             </div>

            {activeWallet && (
              <div className="flex flex-col items-center gap-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Scan the QR code or copy the address below to deposit {activeWallet.name} ({selectedDepositAsset.toUpperCase()}).
                </p>
                <div className="p-2 rounded-lg border bg-card shadow-sm">
                  <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${depositWallets[selectedDepositAsset].address}`}
                    alt="QR Code"
                    width={200}
                    height={200}
                    key={selectedDepositAsset}
                    className="rounded-md"
                  />
                </div>
                <div className="relative w-full">
                  <Input
                    type="text"
                    value={activeWallet.address}
                    readOnly
                    className="pr-10 text-center sm:text-left font-mono text-xs"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                    onClick={handleCopy}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    {activeWallet.warning} Sending any other asset may result in permanent loss.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </TabsContent>
          <TabsContent value="withdraw" className="mt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" type="number" step="any" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="asset"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an asset" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cryptoData.map(coin => renderSelectItem(coin))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter wallet address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Submitting..." : "Request Withdrawal"}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

"use client";
import { USDC_TOKEN } from "@/_config/uniswap-v4-deployments/eth:1";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuoteExactInputSingle } from "@/services/eth:1/quoter/useQuoteExactInputSingle";
import { formatUnits } from "ethers";

export const HeroSection = () => {
  const { data, refetch, isFetching, isLoading } = useQuoteExactInputSingle();

  return (
    <div className=" flex  justify-center py-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>ETH Price</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Result:
            {data && formatUnits(data[0], USDC_TOKEN.decimals)}
          </p>
        </CardContent>

        <CardFooter>
          <Button
            onClick={() => {
              refetch();
            }}
          >
            Refresh {isFetching && "isFetching"} {isLoading && "isLoading"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

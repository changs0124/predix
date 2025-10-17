import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useRecoilState } from "recoil";
import { useEffect, useState } from "react";
import { exeInstance } from "../apis/instance";
import { serverInfoAtom } from "../atoms/dataAtoms";

export const useServerInfoQuery = (tabId) => {
    const queryClient = useQueryClient();
    const [serverInfo, setServerInfo] = useRecoilState(serverInfoAtom(tabId));
    const [isQueryEnabled, setIsQueryEnabled] = useState(true);

    const info = useQuery({
        queryKey: ["info", serverInfo],
        queryFn: () => exeInstance(serverInfo?.port).get(`/info/${serverInfo?.id}`).then(res => res.data),
        enabled: serverInfo?.id !== "" && !!serverInfo?.port,
        retry: false,
        refetchOnWindowFocus: false,
        refetchIntervalInBackground: true,
        refetchInterval: isQueryEnabled ? 5000 : false
    });

    useEffect(() => {
        if (info?.isError && info?.errorUpdateCount > 9) {
            window.electronAPI.showAlert("Exe execution failed");
            setIsQueryEnabled(false);
            setServerInfo({
                id: "",
                port: 0,
            });
            queryClient.removeQueries({ queryKey: ["info", serverInfo] });
            return;
        }

        if (info?.isPending || (info?.isError && info?.errorUpdateCount <= 9)) {
            setIsQueryEnabled(true);
            return;
        }

        if (info?.isSuccess) {
            setIsQueryEnabled(false);
        }
    }, [info?.isPending, info?.isError, info?.errorUpdateCount, info?.isSuccess]);

    return { info, isQueryEnabled, serverInfo };
};
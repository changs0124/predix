/** @jsxImportSource @emotion/react */
import * as s from './style';
import Layout from '../../components/Layout/Layout';
import { useRecoilValue } from 'recoil';
import { serverIdAtom, tabIdAtom, tabsAtom } from '../../atoms/tabAtoms';
import { tabStatusAtom } from '../../atoms/statusAtoms';
import { useServerInfoQuery } from '../../hooks/useServerInfoQuery';
import { ToastContainer } from 'react-toastify';
import Loading from '../../components/Loading/Loading';
import SideBar from '../../components/SideBar/SideBar';
import TabModal from '../../components/TabModal/TabModal';
import Container from '../../components/Container/Container';
import InputBox from '../../components/InputBox/InputBox';
import SvgBox from '../../components/SvgBox/SvgBox';
import OutputBox from '../../components/OutputBox/OutputBox';
import GraphBox from '../../components/GraphBox/GraphBox';
import ViewerBox from '../../components/ViewerBox/ViewerBox';

function IndexPage() {
    const tabs = useRecoilValue(tabsAtom);
    const tabId = useRecoilValue(tabIdAtom);
    const tabStatus = useRecoilValue(tabStatusAtom);
    const serverId = useRecoilValue(serverIdAtom(tabId));

    const { info, serverInfo } = useServerInfoQuery(tabId);

    return (
        <Layout>
            <ToastContainer />
            {
                tabStatus &&
                <TabModal />
            }
            {
                (info?.isPending || info?.isError) && (serverInfo?.id !== '' && !!serverInfo?.port) &&
                <Loading />
            }
            <SideBar />
            <Container>
                {
                    !!tabs?.length &&
                    <>
                        <div css={s.layout}>
                            <InputBox info={info} />
                            <SvgBox />
                            <OutputBox info={info} />
                        </div>
                        <div css={s.layout}>
                            <GraphBox graphInfo={info?.data?.graph} />
                            {
                                serverId === 1 &&
                                <ViewerBox info={info} />
                            }
                        </div>
                    </>
                }
            </Container>
        </Layout>
    );
}

export default IndexPage;
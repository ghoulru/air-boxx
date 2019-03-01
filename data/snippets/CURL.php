<?php
/**
 * Class CURL
 * @package core
 * @version 1.0.2
 */
class CURL
{
    private $url;
    private $data = '';
    public $error = '';
    private $post = array();
    private $userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:43.0) Gecko/20100101 Firefox/43.0';
    private $curlInfo;

	public $addJsonHeader = false;

    private static $cookieFile;

    /*
     * $cond - состояния:
     * 			SIMPLE - просто получить содержимое страницы
     * 			POST -  получить содержимое страницы c отправкой ПОСТ данных
     *
     */
    function __construct($url = '', $multi = false, $cond = 'SIMPLE')
    {
        self::$cookieFile = dirname(__FILE__).'/cook1.txt';
        $this->setUserAgent();

        if($url != ''){

            $this->url = $url;

            if(!$multi && $cond == 'SIMPLE' )
                $this->getRemoteData();

        }
    }
    public function setUserAgent($str = '', $rnd = true){
        if( $rnd )
            $this->userAgent = $this->userAgents[mt_rand(0, count($this->userAgents)-1)];
        elseif( $str != '')
            $this->userAgent = $str;
    }
    /*
     * установить пост данные
     */
    public function setPost(array $_post){
        $this->post = $_post;
    }
    /*
     * запустить
     */
    public function run( $url = '', $onlyHeaders = false ){
        if( $url != '')
            $this->url = $url;
        $this->getRemoteData($onlyHeaders);
    }
    public function getData( $clear = false){
        if( $clear )
            $this->data = $this->clearData($this->data);
        return $this->data;
    }

    public function getInfo(){
        return $this->curlInfo;
    }
    public function getCode(){
        if( isset($this->curlInfo['http_code']) )
            return $this->curlInfo['http_code'];
        else
            return null;
    }
    public function getJSONData(){

        $data = json_decode($this->data, true);
//        if($data == null)
//            $resArray = 'false';
//        else
//            $resArray = $data['response'];

//        return $resArray;
		return $data;
    }

    private function getRemoteData($onlyHeaders = false){

        $newThread = curl_init();

        curl_setopt_array($newThread, array(
                CURLOPT_URL            => $this->url,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_CONNECTTIMEOUT => 5,
                //CURLOPT_FOLLOWLOCATION => 1,
                CURLOPT_TIMEOUT        => 5,
                //CURLOPT_POST           => 0,
                // CURLOPT_POSTFIELDS     => '', // тут POST,
                CURLOPT_USERAGENT	   => $this->userAgent,
                // который идёт от браузера к серверу
                CURLOPT_COOKIESESSION  => true,
                CURLOPT_COOKIEFILE     => self::$cookieFile,
                CURLOPT_COOKIEJAR      => self::$cookieFile,
            )
        );

        if( !empty($this->post) ){
            curl_setopt($newThread, CURLOPT_POST, 1);
            curl_setopt($newThread, CURLOPT_POSTFIELDS, $this->post);
        }

        if ($onlyHeaders)
            curl_setopt($newThread, CURLOPT_NOBODY, true);

        if ($this->addJsonHeader)
			curl_setopt($newThread, CURLOPT_HTTPHEADER, ['Content-Type:application/json']);

        $data = curl_exec($newThread);

        if(curl_errno($newThread) != 0)
        {
            $this->error = curl_errno($newThread).' error ' . curl_error($newThread);
            return null;
        }

        $this->curlInfo = curl_getinfo($newThread);

        $this->data = $data;
        curl_close($newThread);

        if( preg_match('/404/is', $this->getPageTitle()) )
            $this->data = '';
        if( is_file(self::$cookieFile))
            unlink(self::$cookieFile);
        //return true;
    }
    /*
     * получить титл страницы
     */
    public function getPageTitle()
    {
        if( $this->data != '')
        {
            preg_match('/<title>(.*?)<\/title>/is',$this->data, $match);

            preg_match('/content="text\/html; charset=([^"\']*)("|\')/is', $this->data, $matchEnc);

            if( isset($match[1]))
            {
                $title = $match[1];
                if( isset($matchEnc[1]) && $matchEnc[1]!='')
                    $title = mb_convert_encoding($title, "utf-8", $matchEnc[1] );
                else
                    $title = $match[1];

                $title = substr($title, 0, 250);

                return $title;
            }
            else
                return '';
        }
    }
    /*
     * многопоточный запрос
     */
    public function getMultiData(array $urls, array $postData){

        $curls = array();
        $result = array();

        // multi handle
        $mh = curl_multi_init();

        foreach($urls as $key => $url){
            /*
             * init
             */
            $curls[$key] = curl_init();
            if(curl_errno($curls[$key]) != 0)
                echo curl_errno($curls[$key]).' error ' . curl_error($curls[$key]);
            /*
             * post - данные
             * action - действие
             * fileURL - адрес файла со ссылками для скачки
             */
            /*
            foreach($postData[$url] as $k=>$val){
              $post['page_'.$k] = $val[0];
              $post['link_'.$k] = $val[1];
            }*/
            //pre($postData);
            /*
             * options
             */
            $curlOptions = array(
                CURLOPT_URL            => $url,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_CONNECTTIMEOUT => 20,
                //CURLOPT_FOLLOWLOCATION => 1,
                CURLOPT_TIMEOUT        => 10,
                CURLOPT_POST           => 1,
                CURLOPT_POSTFIELDS     => $postData[$url], // тут POST,
                CURLOPT_USERAGENT	   => $this->userAgent,
                // который идёт от браузера к серверу
                //CURLOPT_COOKIESESSION  => true,
                //CURLOPT_COOKIEFILE     => self::$cookieFile,
                //CURLOPT_COOKIEJAR      => self::$cookieFile,
            );

            curl_setopt_array($curls[$key], $curlOptions);

            curl_multi_add_handle($mh, $curls[$key]);

        }
        // execute the handles
        $running = null;
        do {
            curl_multi_exec($mh, $running);
        } while($running > 0);

        foreach($curls as $key => $val){
            $result[$key] = curl_multi_getcontent($val);
            curl_multi_remove_handle($mh, $val);
        }

        curl_multi_close($mh);

        return $resArray;
    }


    public function clearData($str){
        $str = preg_replace("#<!--.*?-->#is", "", $str);
        $str = preg_replace("#[\t\v\r\n]#is", "", $str);
        return preg_replace("#\\s{2,}#is", "", $str);
    }

    private $userAgents = array(
        'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:41.0) Gecko/20100101 Firefox/41.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/534.24 (KHTML, like Gecko) RockMelt/0.9.58.494 Chrome/11.0.696.71 Safari/534.24',
        'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36',
        'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.71 Safari/537.36',
        'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36 OPR/33.0.1990.58',
        'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36 OPR/33.0.1990.115',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:43.0) Gecko/20100101 Firefox/43.0',
        'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.80 Safari/537.36',
        'Mozilla/5.0 (Linux; Android 5.1.1; Nexus 7 Build/LMY48G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.83 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/600.8.9 (KHTML, like Gecko) Version/7.1.8 Safari/537.85.17',
        'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:37.0) Gecko/20100101 Firefox/37.0',
        'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:39.0) Gecko/20100101 Firefox/39.0',
        'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.0',
        'Mozilla/5.0 (Linux; U; Android 4.0.4; ru-ru; GT-P7500 Build/IMM76D) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Safari/534.30',
        'Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko',
        'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:44.0) Gecko/20100101 Firefox/44.0',
        'Mozilla/5.0 (iPad; CPU OS 9_2 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13C75 Safari/601.1',
        'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.82 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64; rv:38.0) Gecko/20100101 Firefox/38.0',
        'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:43.0) Gecko/20100101 Firefox/43.0',
        'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36 OPR/34.0.2036.50',
        'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 YaBrowser/15.9.2403.3043 Safari/537.36'
    );
}
?>
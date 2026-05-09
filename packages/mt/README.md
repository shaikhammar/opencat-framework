# opencat/mt

Machine translation adapters for the [OpenCAT Framework](https://github.com/shaikhammar/opencat-framework).

Provides `DeepLAdapter` and `GoogleTranslateAdapter`, both built on PSR-18 HTTP client injection. Inline codes (`InlineCode` objects) survive the MT round-trip as numbered XML placeholders.

## Installation

```bash
composer require opencat/mt
```

You also need a PSR-18 HTTP client. [Guzzle](https://packagist.org/packages/guzzlehttp/guzzle) is the most common choice:

```bash
composer require guzzlehttp/guzzle
```

## DeepL adapter

```php
use CatFramework\Mt\DeepL\DeepLAdapter;
use GuzzleHttp\Client as GuzzleClient;
use GuzzleHttp\Psr7\HttpFactory;

$http    = new GuzzleClient();
$factory = new HttpFactory();

$adapter = new DeepLAdapter(
    httpClient: $http,
    requestFactory: $factory,
    streamFactory: $factory,
    apiKey: 'your-deepl-api-key',
    // Free tier keys end with ":fx" — the adapter selects the correct endpoint automatically
);

// Translate a single segment
$translated = $adapter->translate($sourceSegment, 'en-US', 'fr-FR');

// Translate many segments in one HTTP request
$translatedBatch = $adapter->translateBatch($segments, 'en-US', 'fr-FR');
```

DeepL free-tier keys (ending in `:fx`) are routed to `api-free.deepl.com` automatically. Pro keys go to `api.deepl.com`.

On `429 Too Many Requests` or `5xx` errors the adapter retries up to three times with 1-second delays (configurable via `$retryDelays`):

```php
$adapter = new DeepLAdapter($http, $factory, $factory, $apiKey, retryDelays: [500_000, 1_000_000]);
// 0.5 s then 1 s before giving up
```

## Google Translate adapter

```php
use CatFramework\Mt\Google\GoogleTranslateAdapter;

$adapter = new GoogleTranslateAdapter(
    httpClient: $http,
    requestFactory: $factory,
    streamFactory: $factory,
    apiKey: 'your-google-api-key',
    projectId: 'your-gcp-project-id',
);

$translated = $adapter->translate($sourceSegment, 'en', 'fr');
```

## Null adapter (testing)

`NullMtAdapter` implements `MachineTranslationInterface` and returns copies of the source segment unchanged. Use it in tests or dry-runs where you don't want to call a live API:

```php
use CatFramework\Mt\NullMtAdapter;

$adapter = new NullMtAdapter();
$result  = $adapter->translate($segment, 'en', 'fr');
// $result->getPlainText() === $segment->getPlainText()
```

## Inline code preservation

`InlineCode` elements are converted to `<x id="N"/>` placeholders before sending to the MT API (`tag_handling=xml` for DeepL). The MT engine treats them as opaque tokens and repositions them in the translated text. On the way back they are restored to the original `InlineCode` objects.

If the MT response is malformed XML, the adapter falls back to stripping all `<x …/>` tags and returning a plain-text segment — degraded output is better than a crash.

## Error codes

`MtException` carries a typed error code:

| Code constant | Meaning |
|---|---|
| `MtException::AUTH_FAILED` | 403 — invalid API key |
| `MtException::RATE_LIMITED` | 429 — too many requests |
| `MtException::QUOTA_EXCEEDED` | 456 — DeepL character quota exceeded |
| `MtException::BAD_REQUEST` | 4xx other |
| `MtException::SERVER_ERROR` | 5xx |

## Custom adapter

Extend `AbstractMtAdapter` and implement the `MachineTranslationInterface` contract. The base class provides `encodeSegment()`, `decodeXml()`, `sendRequest()`, and `retry()`:

```php
use CatFramework\Mt\AbstractMtAdapter;
use CatFramework\Core\Model\Segment;

class MyMtAdapter extends AbstractMtAdapter
{
    public function translate(Segment $source, string $sourceLanguage, string $targetLanguage): Segment
    {
        ['text' => $text, 'map' => $map] = $this->encodeSegment($source);
        // send $text to your MT API ...
        $responseText = '...';
        return $this->decodeXml($responseText, $map, $source->id . '-mt');
    }

    public function translateBatch(array $sources, string $sourceLanguage, string $targetLanguage): array
    {
        return array_map(fn($s) => $this->translate($s, $sourceLanguage, $targetLanguage), $sources);
    }

    public function getProviderId(): string { return 'my-mt'; }
}
```

## Related packages

- [`opencat/core`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/core) — `MachineTranslationInterface`, `Segment`, `InlineCode`, `MtException`
- [`opencat/workflow`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/workflow) — uses `MachineTranslationInterface` to fill segments below the TM threshold
